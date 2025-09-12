export function GreeButton({ children, onClick }) {
    const style = {
        borderRadius: "30px",
        padding: "10px 20px",
        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.6)",
        transition: "transform 0.2s ease-in-out",
        background: "linear-gradient(45deg, #28a745, #71dd8a)",
        color: "#fff",
        margin: "10px auto",
        border: "none",
        cursor: "pointer",
    };
    const handleMouseEnter = (e) => (e.currentTarget.style.transform = "scale(1.1)");
    const handleMouseLeave = (e) => (e.currentTarget.style.transform = "scale(1)");

    return (
        <button
            style={style}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </button>
    );
}

export function OrangeButton({ children, onClick }) {
    const style = {
        borderRadius: "30px",
        padding: "10px 20px",
        boxShadow: "0 4px 15px rgba(220, 53, 69, 0.6)",
        transition: "transform 0.2s ease-in-out",
        background: "linear-gradient(45deg, #dc3545, #ff6b6b)",
        color: "#fff",
        margin: "10px auto",
        border: "none",
        cursor: "pointer",
    };
    const handleMouseEnter = (e) => (e.currentTarget.style.transform = "scale(1.1)");
    const handleMouseLeave = (e) => (e.currentTarget.style.transform = "scale(1)");

    return (
        <button
            style={style}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </button>
    );
}

export function RedButton({ onClick }) {
    const style = {
        borderRadius: "50px",
        padding: "8px 16px",
        boxShadow: "0 4px 12px rgba(220, 53, 69, 0.8)",
        transition: "transform 0.2s ease-in-out",
        background: "linear-gradient(45deg, #dc3545, #ff6b6b)",
        color: "#fff",
        margin: "10px auto",
        border: "none",
        cursor: "pointer",
    };
    const handleMouseEnter = (e) => (e.currentTarget.style.transform = "scale(1.1)");
    const handleMouseLeave = (e) => (e.currentTarget.style.transform = "scale(1)");

    return (
        <button
            style={style}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            🗑️ Eliminar
        </button>
    );
}

export function SkyButton({ children, onClick }) {
    const style = {
        borderRadius: "30px",
        padding: "10px 20px",
        boxShadow: "0 4px 15px rgba(0, 123, 255, 0.6)",
        transition: "transform 0.2s ease-in-out",
        background: "linear-gradient(45deg, #007bff, #339cff)",
        color: "#fff",
        margin: "10px auto",
        border: "none",
        cursor: "pointer",
    };
    const handleMouseEnter = (e) => (e.currentTarget.style.transform = "scale(1.1)");
    const handleMouseLeave = (e) => (e.currentTarget.style.transform = "scale(1)");

    return (
        <button
            style={style}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </button>
    );
}

export function BlueButton({ children, onClick, type = "button" }) {
    const style = {
        borderRadius: "30px",
        padding: "12px 25px",
        boxShadow: "0 4px 15px rgba(0, 123, 255, 0.6)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        background: "linear-gradient(45deg, #007bff, #339cff)",
        color: "#fff",
        margin: "10px auto",
        border: "none",
        cursor: "pointer",
        width: "100%",
        fontSize: "1.1rem",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "1px",
    };

    const handleMouseEnter = (e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.8)";
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 123, 255, 0.6)";
    };

    return (
        <button
            type={type}
            style={style}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </button>
    );
}