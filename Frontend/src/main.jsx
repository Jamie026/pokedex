import { createRoot } from "react-dom/client"
import App from "./app.jsx"
import { AuthProvider } from "./contexts/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";
import "./assets/css/index.css";

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);