import "../styles/Sidebar.css";
import { NavLink } from "react-router-dom";

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
  return (
    <aside className="sidebar">

      {/* Logo */}

      <div className="sidebar-logo">
        <img src={logo} alt="FeelSafe Logo" />
      </div>

      {/* Menú */}

      <nav className="sidebar-menu">

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