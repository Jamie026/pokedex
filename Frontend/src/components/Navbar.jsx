import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../assets/css/navbar.css";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark pokedex-navbar shadow-lg w-100">
            <div className="container">
                <Link className="navbar-brand fw-bold text-white fs-4 d-flex align-items-center" to="/dashboard">
                    <img
                        src="https://images.icon-icons.com/851/PNG/512/pikachu_icon-icons.com_67535.png"
                        alt="Pokedex"
                        className="navbar-logo"
                    />
                    Pokemon Online
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto me-3">
                        <li className="nav-item">
                            <Link className="nav-link nav-link-glow" to="/dashboard">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-glow" to="/battles">Batallas</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-glow" to="/team">Mi equipo</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-glow" to="/profile">Mi perfil</Link>
                        </li>
                    </ul>
                    <button className="btn btn-warning"
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </button >
                </div>
            </div>
        </nav>
    );
}
