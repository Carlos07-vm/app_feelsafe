import "../styles/Sidebar.css";
// 1. Agregamos useLocation aquí:
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
// 2. Importamos useEffect y useRef de React:
import { useEffect, useRef } from "react"; 

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
  
  // 3. Declaramos las herramientas para el scroll:
  const location = useLocation(); 
  const navRef = useRef(null); 

  // 4. Esta es la función que arregla el problema (Auto-scroll):
  useEffect(() => {
    if (navRef.current) {
      const activeItem = navRef.current.querySelector(".active");
      if (activeItem) {
        // Esto hace que la barra baje suavemente hasta el botón activo
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [location.pathname]);

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
      {/* 5. Enlazamos la navegación con navRef */}
      <nav className="sidebar-menu" ref={navRef}> 

        {/* ================= PRINCIPAL ================= */}
        <p className="sidebar-title">
          Principal
        </p>

        {/* 6. Agregamos onClick={onClose} a todos los NavLink para el celular */}
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaHome />
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/mood"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaSmile />
          <span>Emociones</span>
        </NavLink>

        <NavLink
          to="/chat"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaRobot />
          <span>Chat IA</span>
        </NavLink>

        <NavLink
          to="/reports"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaChartBar />
          <span>Reportes</span>
        </NavLink>

        {/* ================= Especialistas ================= */}
        <NavLink
          to="/specialists"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaUserMd />
          <span>Especialistas</span>
        </NavLink>

        <hr />

        {/* ================= HERRAMIENTAS ================= */}
        <p className="sidebar-title">
          Herramientas
        </p>

        <NavLink
          to="/resources"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBook />
          <span>Recursos</span>
        </NavLink>

        <NavLink
          to="/calendar"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaCalendarAlt />
          <span>Calendario</span>
        </NavLink>

        <NavLink
          to="/analysis"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBrain />
          <span>Análisis IA</span>
        </NavLink>

        <hr />

        {/* ================= CUENTA ================= */}
        <p className="sidebar-title">
          Cuenta
        </p>

        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaUserCircle />
          <span>Perfil</span>
        </NavLink>

        <NavLink
          to="/alerts"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBell />
          <span>Alertas</span>
        </NavLink>

        <NavLink
          to="/goals"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBullseye />
          <span>Objetivos</span>
        </NavLink>

        <NavLink
          to="/sos"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaLifeRing />
          <span>Centro SOS</span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;