import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import { GreeButton, OrangeButton, RedButton, SkyButton } from "../components/Buttons";

function Team() {
    const token = localStorage.getItem("token");

    const [team, setTeam] = useState([]);
    const [pokemonList, setPokemonList] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [moves, setMoves] = useState([]);
    const [movesLoading, setMovesLoading] = useState(false);
    const [modalPokemonName, setModalPokemonName] = useState("");

    const fetchTeam = async () => {
        try {
            const res = await axios.get("/teams", { headers: { Authorization: "Bearer " + token } });
            setTeam(res.data.data || []);
        } catch (error) {
            setTeam([]);
        }
    };

    const fetchPokemonList = async () => {
        if (searchName.trim() !== "") return;
        setLoading(true);
        const start = page * 20 + 1;
        const end = start + 19;
        const requests = [];
        for (let i = start; i <= end; i++) {
            requests.push(
                fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((res) => res.json())
            );
        }
        const results = await Promise.all(requests);
        setPokemonList(results);
        setLoading(false);
    };

    const handleSearch = async () => {
        const value = searchName.trim().toLowerCase();
        if (value === "") {
            setSearchResult(null);
            toast.info("Escribe un nombre para buscar.");
            return;
        }

        setSearchLoading(true);
        try {
            const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + value);
            if (!res.ok) throw new Error("No encontrado");
            const data = await res.json();
            setSearchResult(data);
        } catch {
            setSearchResult(null);
            toast.error("Pokémon no encontrado");
        } finally {
            setSearchLoading(false);
        }
    };

    const addToTeam = async (pokemonId) => {
        if (team.includes(pokemonId)) {
            toast.info("Este Pokémon ya está en tu equipo");
            return;
        }
        if (team.length >= 6) {
            toast.warn("El equipo ya tiene 6 Pokémon, no puedes agregar más.");
            return;
        }
        try {
            await axios.post("/teams", { pokemonId: pokemonId }, { headers: { Authorization: "Bearer " + token } });
            setTeam((prev) => [...prev, pokemonId]);
            toast.success("Pokémon agregado a tu equipo");
        } catch (error) {
            toast.error("Error al agregar pokemon al equipo");
        }
    };

    const removeFromTeam = async (pokemonId) => {
        try {
            await axios.delete("/teams/" + pokemonId, { headers: { Authorization: "Bearer " + token } });
            setTeam((prev) => prev.filter((id) => id !== pokemonId));
            toast.success("Pokémon eliminado del equipo");
        } catch (error) {
            console.log(error)
            toast.error("Error elimando pokemon del equipo");
        }
    };

    const playCry = (url) => {
        if (!url) {
            toast.error("No se encontró el grito de este Pokémon");
            return;
        }
        const audio = new Audio(url);
        audio.play();
    };

    const openMovesModal = async (pokemonId, pokemonName) => {
        setModalOpen(true);
        setMovesLoading(true);
        setModalPokemonName(pokemonName || "");
        try {
            const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonId);
            if (!res.ok) throw new Error("Error al cargar movimientos");
            const data = await res.json();

            const movesWithEffects = await Promise.all(
                data.moves.map(async ({ move, version_group_details }) => {
                    try {
                        const resMove = await fetch(move.url);
                        if (!resMove.ok) throw new Error();
                        const moveData = await resMove.json();
                        const effectEntry = moveData.effect_entries.find(
                            (entry) => entry.language.name === "en"
                        );
                        return {
                            name: move.name,
                            effect: effectEntry ? effectEntry.effect : "No description available.",
                            version_group_details,
                        };
                    } catch {
                        return {
                            name: move.name,
                            effect: "No description available.",
                            version_group_details,
                        };
                    }
                })
            );

            setMoves(movesWithEffects);
        } catch (error) {
            toast.error("Error cargando movimientos");
            setMoves([]);
        } finally {
            setMovesLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setMoves([]);
        setModalPokemonName("");
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    useEffect(() => {
        fetchPokemonList();
    }, [page, searchName]);

    return (
        <div className="home-container">
            <Navbar />
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="container py-4 mt-5">
                <h1 className="text-center my-4 fw-bold text-warning">Mi Equipo</h1>

                <div className="mb-5">
                    {team.length === 0 ? (
                        <div className="text-center p-4 border border-warning rounded shadow-sm text-light">
                            <p className="mb-0">Aún no tienes ningún Pokémon en tu equipo.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {team.map((id) => {
                                const pokemonData =
                                    searchResult?.id === id
                                        ? searchResult
                                        : pokemonList.find((p) => p.id === id);
                                return (
                                    <div key={id} className="col-6 col-md-4 col-lg-2">
                                        <div
                                            className="card h-100 text-center border border-warning"
                                            style={{ background: "linear-gradient(145deg, #222, #333)" }}
                                        >
                                            <img
                                                src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png"}
                                                className="card-img-top p-3"
                                                alt={"Pokemon " + id}
                                            />
                                            <div className="card-body d-flex flex-column justify-content-center align-items-center">
                                                <SkyButton onClick={() => openMovesModal(id, pokemonData?.name || "")}>
                                                    👊 Movimientos
                                                </SkyButton>

                                                <RedButton onClick={() => removeFromTeam(id)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <h2 className="mb-3 text-warning">Pokédex</h2>

                <div className="mb-4 d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar Pokémon por nombre"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                    <button
                        className="btn btn-warning fw-bold"
                        onClick={handleSearch}
                        disabled={searchLoading}
                    >
                        {searchLoading ? "Buscando..." : "Buscar"}
                    </button>
                </div>

                {loading && !searchName ? (
                    <p className="text-center text-light">Cargando...</p>
                ) : (
                    <div className="row g-4">
                        {searchName && searchResult ? (
                            <div key={searchResult.id} className="col-6 col-md-4 col-lg-3">
                                <div
                                    className="card h-100 text-center border border-danger rounded shadow-lg"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.08)",
                                        backdropFilter: "blur(12px) saturate(180%)",
                                        borderColor: "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    <img
                                        src={searchResult.sprites.front_default}
                                        className="card-img-top p-3"
                                        alt={searchResult.name}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title text-light text-capitalize">{searchResult.name}</h5>
                                        <div className="mb-2">
                                            {searchResult.types.map((t) => (
                                                <span
                                                    key={t.type.name}
                                                    className="badge bg-warning text-dark mx-1 px-2 py-2"
                                                    style={{ textTransform: "uppercase" }}
                                                >
                                                    {t.type.name.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                        <GreeButton onClick={() => addToTeam(searchResult.id)}>
                                            ➕ Agregar a equipo
                                        </GreeButton>
                                        <br />
                                        <OrangeButton onClick={() => playCry(searchResult.cries?.latest)}>
                                            🔊 Grito
                                        </OrangeButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            pokemonList.map((p) => (
                                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                                    <div
                                        className="card h-100 text-center border border-danger rounded shadow-lg"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(12px) saturate(180%)",
                                            borderColor: "rgba(255,255,255,0.25)",
                                        }}
                                    >
                                        <img
                                            src={p.sprites.front_default}
                                            className="card-img-top p-3"
                                            alt={p.name}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title text-light text-capitalize">{p.name}</h5>
                                            <div className="mb-2">
                                                {p.types.map((t) => (
                                                    <span
                                                        key={t.type.name}
                                                        className="badge bg-warning text-dark mx-1 px-2 py-2"
                                                        style={{ textTransform: "uppercase" }}
                                                    >
                                                        {t.type.name.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                            <GreeButton onClick={() => addToTeam(p.id)}>
                                                ➕ Agregar a equipo
                                            </GreeButton>
                                            <br />
                                            <OrangeButton onClick={() => playCry(p.cries?.latest)}>
                                                🔊 Grito
                                            </OrangeButton>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                    <button
                        className="btn btn-warning fw-bold px-4"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0 || searchName !== ""}
                    >
                        Anterior
                    </button>
                    <button
                        className="btn btn-warning fw-bold px-4"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={searchName !== ""}
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {modalOpen && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        overflowY: "auto",
                        zIndex: 1050,
                    }}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="modal-dialog modal-dialog-scrollable modal-lg"
                        role="document"
                    >
                        <div className="modal-content" style={{ backgroundColor: "#222" }}>
                            <div className="modal-header">
                                <h5 className="modal-title text-warning text-capitalize">
                                    Movimientos de {modalPokemonName || "Pokémon"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeModal}
                                    aria-label="Cerrar"
                                ></button>
                            </div>
                            <div className="modal-body text-light">
                                {movesLoading ? (
                                    <p>Cargando movimientos...</p>
                                ) : moves.length === 0 ? (
                                    <p>No se encontraron movimientos.</p>
                                ) : (
                                    <ul
                                        style={{
                                            maxHeight: "60vh",
                                            overflowY: "auto",
                                            paddingLeft: 0,
                                            listStyle: "none",
                                        }}
                                    >
                                        {moves.map(({ name, effect }) => (
                                            <li
                                                key={name}
                                                style={{
                                                    marginBottom: "10px",
                                                    borderBottom: "1px solid #444",
                                                    paddingBottom: "5px",
                                                }}
                                            >
                                                <strong className="text-capitalize">{name.replace(/-/g, " ")}</strong>
                                                <p>{effect}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Team;