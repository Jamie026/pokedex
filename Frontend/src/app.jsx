import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/home";
import Dashboard from "./views/dashboard";
import Team from "./views/team";
import Battles from "./views/battles";
import Battle from "./views/battle";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/team"
                    element={
                        <PrivateRoute>
                            <Team />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/battles"
                    element={
                        <PrivateRoute>
                            <Battles />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/battle/:id"
                    element={
                        <PrivateRoute>
                            <Battle />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;