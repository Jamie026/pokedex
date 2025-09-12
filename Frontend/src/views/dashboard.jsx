import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";

function Dashboard() {

    return (
        <>
            <Navbar />
            <div className="home-container">
                <ToastContainer position="top-center" autoClose={3000} />
                <h1 className="text-center mt-5">Bienvenido a tu Dashboard</h1>
            </div>
        </>
    );
}

export default Dashboard;
