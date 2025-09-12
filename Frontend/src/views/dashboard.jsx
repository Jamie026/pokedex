import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar"; 

function Dashboard() {
    const token = localStorage.getItem("token");

    const config = {
        headers: {
            Authorization: "Bearer " + token,
        }
    };

    return (
        <div className="fluid-container">
            <Navbar /> 
            <ToastContainer position="top-center" autoClose={3000} />
            <h1 className="text-center mt-4">Bienvenido a tu Dashboard</h1>
        </div>
    );
}

export default Dashboard;
