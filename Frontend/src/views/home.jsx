import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
    const [isRegister, setIsRegister] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        username: "",
        usernameOrEmail: "",
        password: "",
        email: "",
    });

    const [fadeImage, setFadeImage] = useState(false);

    const handleSwitchForm = () => {
        setFadeImage(true);
        setTimeout(() => {
            setIsRegister(!isRegister);
            setFadeImage(false);
            setFormData({
                name: "",
                lastname: "",
                username: "",
                usernameOrEmail: "",
                password: "",
                email: "",
            });
        }, 300);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                const res = await api.post("/users/register", {
                    name: formData.name,
                    lastname: formData.lastname,
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                });
                toast.success(res.data.message);
                setIsRegister(false);
            } else {
                const res = await api.post("/users/login", {
                    usernameOrEmail: formData.usernameOrEmail,
                    password: formData.password,
                });
                toast.success(res.data.message);
                localStorage.setItem("token", res.data.token);
                login();
                setTimeout(() => navigate("/dashboard"), 1000);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Ocurrió un error");
        }
    };

    return (
        <div className="home-container">
            <ToastContainer position="top-center" autoClose={3000} />

            <div className={"modal-full " + (isRegister ? "register-mode" : "")}>
                <div className={"image-side " + (fadeImage ? "fade-out" : "")}></div>

                <div className="form-side">
                    <div className="card form-glass p-4" style={{ width: "500px", borderRadius: "20px" }}>
                        <h3 className="text-center mb-4 fw-bold" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required />
                                        <input type="text" className="form-control" name="lastname" placeholder="Apellido" value={formData.lastname} onChange={handleChange} required />
                                    </div>
                                    <input type="text" className="form-control mb-3" name="username" placeholder="Nombre de Usuario" value={formData.username} onChange={handleChange} required />
                                </>
                            )}
                            {!isRegister && (
                                <input type="text" className="form-control mb-3" name="usernameOrEmail" placeholder="Usuario o Email" value={formData.usernameOrEmail} onChange={handleChange} required />
                            )}
                            <input type="password" className="form-control mb-3" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                            {isRegister && (
                                <input type="email" className="form-control mb-3" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
                            )}
                            <button className="btn btn-primary w-100" type="submit">
                                {isRegister ? "Registrarse" : "Ingresar"}
                            </button>
                        </form>
                        <p className="text-center mt-3">
                            {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                            <span className="form-switch-link" onClick={handleSwitchForm}>
                                {isRegister ? " Inicia sesión" : " Regístrate"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}