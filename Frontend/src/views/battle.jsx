import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

function Battle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [currentUser, setCurrentUser] = useState(null);
    const [playerTeam, setPlayerTeam] = useState([]);
    const [playerActivePokemon, setPlayerActivePokemon] = useState(null);
    const [opponentActivePokemon, setOpponentActivePokemon] = useState(null);
    const [opponentInfo, setOpponentInfo] = useState({ username: "", pokemonsLeft: 6, faintedCount: 0 });
    const [battlePhase, setBattlePhase] = useState("loading");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [battleLog, setBattleLog] = useState([]);
    const [showSwitchSelection, setShowSwitchSelection] = useState(false);
    const [socket, setSocket] = useState(null);
    const [socketId, setSocketId] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);

    const fetchPokemonDetails = async (pokemonId) => {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonId);
        if (!res.ok) throw new Error("No se pudo encontrar el Pokémon con ID: " + pokemonId);
        const data = await res.json();
        const maxHp = data.stats.find(stat => stat.stat.name === "hp").base_stat;
        return { ...data, currentHp: maxHp, maxHp };
    };

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("joinBattleRoom", id);
        });

        newSocket.on("battleReady", async ({ player1, player2, currentUserUsername, initialTurn, myId }) => {
            setSocketId(myId);
            setIsMyTurn(myId === initialTurn);

            const isPlayer1 = player1.username === currentUserUsername;
            const myData = isPlayer1 ? player1 : player2;
            const opponentData = isPlayer1 ? player2 : player1;

            setOpponentInfo(prev => ({ ...prev, username: opponentData.username }));

            try {
                const [myPokemonData, opponentPokemonData] = await Promise.all([
                    fetchPokemonDetails(myData.activePokemonId),
                    fetchPokemonDetails(opponentData.activePokemonId)
                ]);

                setPlayerActivePokemon(myPokemonData);
                setOpponentActivePokemon(opponentPokemonData);
                setBattlePhase("active");
                setBattleLog(prev => ["La batalla comienza.", ...prev]);

                if (myId === initialTurn) {
                    setBattleLog(prev => ["¡Es tu turno!", ...prev]);
                } else {
                    setBattleLog(prev => ["Esperando a " + opponentData.username + "...", ...prev]);
                }

            } catch (err) {
                toast.error("Error al cargar los Pokémon iniciales.");
            }
        });

        newSocket.on("turnResult", async (result) => {
            setBattleLog(prev => [result.logMessage, ...prev]);

            if (result.type === "attack") {
                if (result.target === currentUser) {
                    setPlayerActivePokemon(p => ({ ...p, currentHp: Math.max(0, p.currentHp - result.damage) }));
                } else {
                    setOpponentActivePokemon(p => ({ ...p, currentHp: Math.max(0, p.currentHp - result.damage) }));
                }
            } else if (result.type === "switch") {
                if (result.playerWhoSwitched !== currentUser) {
                    try {
                        const opponentPokemonData = await fetchPokemonDetails(result.newPokemonId);
                        setOpponentActivePokemon(opponentPokemonData);
                        toast.info("Tu oponente ha cambiado a " + opponentPokemonData.name + ".");
                    } catch (err) {
                        toast.error("Error al cargar el Pokémon del oponente.");
                    }
                }
            }
        });

        newSocket.on("newTurn", ({ nextTurn }) => {
            const myTurn = nextTurn === socketId;
            setIsMyTurn(myTurn);
            if (myTurn) {
                setBattleLog(prev => ["Es tu turno", ...prev]);
                toast.success("¡Es tu turno!");
            } else {
                setBattleLog(prev => ["Esperando al oponente...", ...prev]);
            }
        });

        return () => newSocket.disconnect();
    }, [id, token, navigate, currentUser, socketId]);

    useEffect(() => {
        const fetchBattleData = async () => {
            try {
                const res = await axios.get("/battles/" + id + "/teams", { headers: { Authorization: "Bearer " + token } });
                const { battle: battleData, currentUserUsername } = res.data;
                setCurrentUser(currentUserUsername);

                const isPlayer1 = battleData.player1.username === currentUserUsername;
                const playerInfo = isPlayer1 ? battleData.player1 : battleData.player2;

                const playerPokemons = await Promise.all(playerInfo.pokemons.map(fetchPokemonDetails));
                setPlayerTeam(playerPokemons);
                setBattlePhase("initial-select");
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar la batalla.");
            } finally {
                setLoading(false);
            }
        };

        fetchBattleData();
    }, [id, token, navigate]);

    const handleInitialSelect = (pokemonId) => {
        if (socket && currentUser) {
            socket.emit("playerReady", {
                battleId: id,
                initialPokemonId: pokemonId,
                username: currentUser
            });
            setBattlePhase("waiting-opponent");
        }
    };

    const handleSwitchPokemon = (pokemon) => {
        if (!isMyTurn || pokemon.currentHp <= 0 || (playerActivePokemon && pokemon.id === playerActivePokemon.id)) {
            toast.warn("No puedes seleccionar este Pokémon.");
            return;
        }
        if (socket) {
            const action = { type: "switch", newPokemonId: pokemon.id };
            socket.emit("playerAction", { battleId: id, action });

            setPlayerActivePokemon(pokemon);
            setShowSwitchSelection(false);
            setBattleLog(prev => ["Adelante, " + pokemon.name, ...prev]);
            setIsMyTurn(false);
        }
    };

    const handleAttack = (move) => {
        if (!isMyTurn) {
            toast.error("No es tu turno.");
            return;
        }
        if (socket) {
            const action = { type: "attack", moveName: move.name };
            socket.emit("playerAction", { battleId: id, action });
            setBattleLog(prev => [playerActivePokemon.name + " usó " + move.name.replace("-", " "), ...prev]);
            setIsMyTurn(false);
        }
    };

    if (loading) return <div className="battle-page-container"><div className="spinner-border text-warning" role="status"></div></div>;
    if (error) return <div className="battle-page-container text-danger"><h2>{error}</h2></div>;

    if (battlePhase === "initial-select") {
        return (
            <div className="initial-select-container">
                <h1 className="text-warning mb-4">Elige tu Pokémon inicial</h1>
                <div className="pokemon-selection-grid">
                    {playerTeam.map(p => (
                        <div key={p.id} className="pokemon-select-card" onClick={() => handleInitialSelect(p.id)}>
                            <img src={p.sprites.front_default} alt={p.name} />
                            <h5 className="text-capitalize mt-2">{p.name}</h5>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (battlePhase === "waiting-opponent") {
        return (
            <div className="battle-page-container">
                <div className="spinner-border text-warning" style={{ width: "4rem", height: "4rem" }}></div>
                <h2 className="mt-4">Esperando al oponente...</h2>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <div className="battle-container">
                <div className="battle-arena">
                    <div className="battle-side opponent-side">
                        <div className="team-preview opponent-team">
                            {[...Array(opponentInfo.pokemonsLeft)].map((_, i) => <div className={"team-preview-pokeball " + (i >= (opponentInfo.pokemonsLeft - opponentInfo.faintedCount) ? "fainted" : "")}></div>)}
                        </div>
                        {opponentActivePokemon && <PokemonDisplay pokemon={opponentActivePokemon} isPlayer={false} />}
                    </div>
                    <div className="battle-side player-side">
                        {playerActivePokemon && <PokemonDisplay pokemon={playerActivePokemon} isPlayer={true} />}
                        <div className="team-preview player-team">
                            {playerTeam.map(p => <div className={"team-preview-pokeball " + (p.currentHp <= 0 ? "fainted" : "")}></div>)}
                        </div>
                    </div>
                </div>
                <div className="battle-controls-container">
                    <div className="battle-log-box">
                        {battleLog.map((msg, index) => <p key={index} className="log-message">{msg}</p>)}
                    </div>
                    <ActionPanel
                        activePokemon={playerActivePokemon}
                        onAttack={handleAttack}
                        onSwitchClick={() => setShowSwitchSelection(true)}
                        isMyTurn={isMyTurn}
                    />
                </div>
            </div>

            {showSwitchSelection && (
                <div className="switch-pokemon-modal">
                    <div className="switch-pokemon-content">
                        <h2 className="text-warning">Elige un Pokémon</h2>
                        <div className="pokemon-selection-grid">
                            {playerTeam.map(p => (
                                <div
                                    key={p.id}
                                    className={"pokemon-select-card " + (p.currentHp <= 0 || (playerActivePokemon && p.id === playerActivePokemon.id) || !isMyTurn ? "disabled" : "")}
                                    onClick={() => handleSwitchPokemon(p)}
                                >
                                    <img src={p.sprites.front_default} alt={p.name} />
                                    <h5 className="text-capitalize mt-2">{p.name}</h5>
                                    <span>{p.currentHp} / {p.maxHp} HP</span>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-secondary mt-4" onClick={() => setShowSwitchSelection(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </>
    );
}

const PokemonDisplay = ({ pokemon, isPlayer }) => {
    const healthPercentage = (pokemon.currentHp / pokemon.maxHp) * 100;
    return (
        <div className={"pokemon-display " + (isPlayer ? "player" : "opponent")}>
            <div className="pokemon-info-card">
                <h5 className="text-capitalize">{pokemon.name}</h5>
                <div className="health-bar-container">
                    <div className="health-bar" style={{ width: healthPercentage + "%" }}></div>
                </div>
                {isPlayer && <span className="hp-text">{pokemon.currentHp} / {pokemon.maxHp}</span>}
            </div>
            <img
                src={isPlayer ? pokemon.sprites.back_default : pokemon.sprites.front_default}
                alt={pokemon.name}
                className="pokemon-sprite"
            />
        </div>
    );
};

const ActionPanel = ({ activePokemon, onAttack, onSwitchClick, isMyTurn }) => {
    const moves = useMemo(() => activePokemon?.moves.slice(0, 4) || [], [activePokemon]);
    return (
        <div className="action-panel">
            <div className="moves-grid">
                {moves.map(({ move }) => (
                    <button key={move.name} onClick={() => onAttack(move)} className="btn btn-danger m-1 text-capitalize" disabled={!isMyTurn}>
                        {move.name.replace("-", " ")}
                    </button>
                ))}
            </div>
            <button onClick={onSwitchClick} className="btn btn-info switch-btn" disabled={!isMyTurn}>
                🔄 Cambiar
            </button>
        </div>
    );
};

export default Battle;