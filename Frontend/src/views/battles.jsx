import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import { BlueButton, GreeButton } from "../components/Buttons";
import { io } from "socket.io-client";

function Battles() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [waitingBattles, setWaitingBattles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createdBattleId, setCreatedBattleId] = useState(null);

    const fetchWaitingBattles = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/battles/waiting", { headers: { Authorization: "Bearer " + token } });
            setWaitingBattles(res.data.battles || []);
        } catch {
            setWaitingBattles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitingBattles();

        const socket = io("http://localhost:3000");

        socket.on("battleCreated", () => fetchWaitingBattles());
        socket.on("battleCancelled", () => fetchWaitingBattles());
        socket.on("battleJoined", (data) => {
            fetchWaitingBattles();
            if (createdBattleId && data.id === createdBattleId) {
                navigate("/battle/" + createdBattleId);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [createdBattleId]);

    const handleCreateBattle = async () => {
        try {
            const res = await axios.post("/battles/create", {}, { headers: { Authorization: "Bearer " + token } });
            if (res.data.success) {
                setCreatedBattleId(res.data.battle.id);
                toast.success("Sala creada.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creando sala");
        }
    };

    const handleJoinBattle = async (battleId) => {
        try {
            const res = await axios.post("/battles/join/" + battleId, {}, { headers: { Authorization: "Bearer " + token } });
            if (res.data.success) {
                navigate("/battle/" + battleId);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al unirse");
        }
    };

    const handleCancelBattle = async () => {
        if (!createdBattleId) return;
        try {
            await axios.delete("/battles/cancel/" + createdBattleId, { headers: { Authorization: "Bearer " + token } });
            setCreatedBattleId(null);
            toast.info("Sala cancelada");
        } catch (error) {
            toast.error("No se pudo cancelar la sala");
        }
    };

    return (
        <div className="home-container">
            <Navbar />
            <ToastContainer position="top-center" autoClose={3000} />

            {createdBattleId && (
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
                                    Modo espera
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={handleCancelBattle}
                                    aria-label="Cerrar"
                                ></button>
                            </div>
                            <div className="modal-body text-light d-flex flex-column justify-content-center align-items-center">
                                <div className="spinner-border text-warning" style={{ width: "4rem", height: "4rem" }} role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p>Esperando a un oponente...</p>
                                <button onClick={handleCancelBattle} className="btn btn-danger mt-3">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container py-4 mt-5">
                <h1 className="text-center my-4 fw-bold text-warning">Salas de Batalla</h1>

                <div className="text-center mb-5">
                    <GreeButton onClick={handleCreateBattle}>
                        ⚔️ Crear Sala de Batalla
                    </GreeButton>
                </div>

                <h2 className="mb-3 text-warning">Salas en Espera</h2>

                {loading ? (
                    <p className="text-center text-light">Cargando salas...</p>
                ) : waitingBattles.length === 0 ? (
                    <div className="text-center p-4 border border-secondary rounded shadow-sm text-light">
                        <p>No hay salas disponibles en este momento.</p>
                    </div>
                ) : (
                    waitingBattles.map((battle) => (
                        <div key={battle.id} className="battle-room-card">
                            <div className="room-info">
                                <span className="room-id">SALA #{battle.id}</span>
                                <span className="creator-info">Creador: {battle.player1Username}</span>
                                <BlueButton onClick={() => handleJoinBattle(battle.id)}>Unirse</BlueButton>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Battles;
