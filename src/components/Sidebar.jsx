import "../styles/Sidebar.css";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

import {
  FaHome,
  FaSmile,
  FaRobot,
  FaChartBar,
  FaBook,
  FaCalendarAlt,
  FaBrain,
  FaUserCircle,
  FaBell,
  FaBullseye,
  FaLifeRing,
} from "react-icons/fa";

import logo from "../assets/logo.jpeg";

function Sidebar() {
  const { user } = useApp();

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="FeelSafe Logo" />

        <h2>FeelSafe</h2>

        <p>Tu bienestar importa</p>
      </div>

      {/* Información del usuario */}
      <div className="sidebar-user">
        {user?.photoURL || user?.foto ? (
          <img
            src={user.photoURL}
            alt="Foto de perfil"
            className="sidebar-user-image"
          />
        ) : (
          <FaUserCircle className="sidebar-user-icon" />
        )}

        <h3>{user?.displayName || user?.nombre || "Usuario"}</h3>

        <p> {user?.email || user?.correo || ""}</p>
      </div>

      <nav className="sidebar-menu">

        {/* PRINCIPAL */}

        <p className="sidebar-title">
          Principal
        </p>

        <NavLink to="/dashboard">
          <FaHome />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/mood">
          <FaSmile />
          <span>Emociones</span>
        </NavLink>

        <NavLink to="/chat">
          <FaRobot />
          <span>Chat IA</span>
        </NavLink>

        <NavLink to="/reports">
          <FaChartBar />
          <span>Reportes</span>
        </NavLink>

        <hr />

        {/* HERRAMIENTAS */}

        <p className="sidebar-title">
          Herramientas
        </p>

        <NavLink to="/resources">
          <FaBook />
          <span>Recursos</span>
        </NavLink>

        <NavLink to="/calendar">
          <FaCalendarAlt />
          <span>Calendario</span>
        </NavLink>

        <NavLink to="/analysis">
          <FaBrain />
          <span>Análisis IA</span>
        </NavLink>

        <hr />

        {/* CUENTA */}

        <p className="sidebar-title">
          Cuenta
        </p>

        <NavLink to="/profile">
          <FaUserCircle />
          <span>Perfil</span>
        </NavLink>

        <NavLink to="/alerts">
          <FaBell />
          <span>Alertas</span>
        </NavLink>

        <NavLink to="/goals">
          <FaBullseye />
          <span>Objetivos</span>
        </NavLink>

        <NavLink to="/sos">
          <FaLifeRing />
          <span>Centro SOS</span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;