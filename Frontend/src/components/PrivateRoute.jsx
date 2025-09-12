import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="home-container">
                <div className="spinner-border text-warning" style={{ width: "4rem", height: "4rem" }} role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <span className="ms-3 fs-5">Entrenando a tus Pokémon...</span>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
