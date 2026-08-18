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
  FaUserMd,
} from "react-icons/fa";

import logo from "../assets/logo.jpeg";

function Sidebar({ sidebarOpen, onClose }) {
  const { user } = useApp();

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

      {/* ================= Botón cerrar en móvil ================= */}

      <div className="sidebar-close-mobile">
        <button onClick={onClose} aria-label="Cerrar menú">
          ✕
        </button>
      </div>

      {/* ================= Logo ================= */}

      <div className="sidebar-logo">

        <img
          src={logo}
          alt="FeelSafe Logo"
        />

        <h2>FeelSafe</h2>

        <p>Tu bienestar importa</p>

      </div>

      {/* ================= Información del usuario ================= */}

      <div className="sidebar-user">

        {user?.photoURL || user?.foto ? (

          <img
            src={user.photoURL || user.foto}
            alt="Foto de perfil"
            className="sidebar-user-image"
          />

        ) : (

          <FaUserCircle
            className="sidebar-user-icon"
          />

        )}

        <h3>
          {user?.displayName ||
            user?.nombre ||
            "Usuario"}
        </h3>

        <p>
          {user?.email ||
            user?.correo ||
            ""}
        </p>

      </div>

      {/* ================= Navegación ================= */}

      <nav className="sidebar-menu">

        {/* ================= PRINCIPAL ================= */}

        <p className="sidebar-title">
          Principal
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaHome />

          <span>
            Inicio
          </span>
        </NavLink>

        <NavLink
          to="/mood"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaSmile />

          <span>
            Emociones
          </span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaRobot />

          <span>
            Chat IA
          </span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaChartBar />

          <span>
            Reportes
          </span>
        </NavLink>

        {/* ================= Especialistas ================= */}

        <NavLink
          to="/specialists"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaUserMd />

          <span>
            Especialistas
          </span>
        </NavLink>

        <hr />

        {/* ================= HERRAMIENTAS ================= */}

        <p className="sidebar-title">
          Herramientas
        </p>

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBook />

          <span>
            Recursos
          </span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaCalendarAlt />

          <span>
            Calendario
          </span>
        </NavLink>

        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBrain />

          <span>
            Análisis IA
          </span>
        </NavLink>

        <hr />

        {/* ================= CUENTA ================= */}

        <p className="sidebar-title">
          Cuenta
        </p>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaUserCircle />

          <span>
            Perfil
          </span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBell />

          <span>
            Alertas
          </span>
        </NavLink>

        <NavLink
          to="/goals"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBullseye />

          <span>
            Objetivos
          </span>
        </NavLink>

        <NavLink
          to="/sos"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaLifeRing />

          <span>
            Centro SOS
          </span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;