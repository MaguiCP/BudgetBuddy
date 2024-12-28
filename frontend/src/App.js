import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <div>
        {/* Barra de Navegação */}
        <nav className="navbar">
          <ul className="navbar-links">
            <li><Link to="/" className="navbar-link">Home</Link></li>
            <li><Link to="/login" className="navbar-link">Login</Link></li>
            <li><Link to="/register" className="navbar-link">Register</Link></li>
          </ul>
        </nav>

        {/* Rotas da Aplicação */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;