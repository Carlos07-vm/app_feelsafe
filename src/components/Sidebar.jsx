import "../styles/Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useEffect, useRef } from "react"; 
import { translations } from "../constants/translations"; // <-- IMPORTAMOS EL DICCIONARIO GLOBAL

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
  const { user, language } = useApp(); // <-- EXTRAEMOS EL IDIOMA GLOBAL
  
  // ACTIVAMOS EL DICCIONARIO
  const t = translations[language] || translations.es;

  const location = useLocation(); 
  const navRef = useRef(null); 

  useEffect(() => {
    if (navRef.current) {
      const activeItem = navRef.current.querySelector(".active");
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

      {/* ================= Botón cerrar en móvil ================= */}
      <div className="sidebar-close-mobile">
         <button type="button" onClick={onClose} aria-label="Cerrar menú">
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
        <p>{language === 'es' ? "Tu bienestar importa" : "Your wellbeing matters"}</p>
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
            (language === 'es' ? "Usuario" : "User")}
        </h3>
        <p>
          {user?.email ||
            user?.correo ||
            ""}
        </p>
      </div>

      {/* ================= Navegación ================= */}
      <nav className="sidebar-menu" id="primary-navigation" aria-label={language === 'es' ? "Navegación principal" : "Main navigation"} ref={navRef}> 

        {/* ================= PRINCIPAL ================= */}
        <p className="sidebar-title">
          {language === 'es' ? "Principal" : "Main"}
        </p>

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaHome />
          <span>{t.menuHome}</span>
        </NavLink>

        <NavLink
          to="/mood"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaSmile />
          <span>{t.menuEmotions}</span>
        </NavLink>

        <NavLink
          to="/chat"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaRobot />
          <span>{t.menuChat}</span>
        </NavLink>

        <NavLink
          to="/reports"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaChartBar />
          <span>{t.menuReports}</span>
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
          <span>{t.menuSpecialists}</span>
        </NavLink>

        <hr />

        {/* ================= HERRAMIENTAS ================= */}
        <p className="sidebar-title">
          {language === 'es' ? "Herramientas" : "Tools"}
        </p>

        <NavLink
          to="/resources"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBook />
          <span>{language === 'es' ? "Recursos" : "Resources"}</span>
        </NavLink>

        <NavLink
          to="/calendar"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaCalendarAlt />
          <span>{language === 'es' ? "Calendario" : "Calendar"}</span>
        </NavLink>

        <NavLink
          to="/analysis"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBrain />
          <span>{language === 'es' ? "Análisis IA" : "AI Analysis"}</span>
        </NavLink>

        <hr />

        {/* ================= CUENTA ================= */}
        <p className="sidebar-title">
          {language === 'es' ? "Cuenta" : "Account"}
        </p>

        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaUserCircle />
          <span>{t.menuProfile}</span>
        </NavLink>

        <NavLink
          to="/alerts"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBell />
          <span>{language === 'es' ? "Alertas" : "Alerts"}</span>
        </NavLink>

        <NavLink
          to="/goals"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaBullseye />
          <span>{language === 'es' ? "Objetivos" : "Goals"}</span>
        </NavLink>

        <NavLink
          to="/sos"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <FaLifeRing />
          <span>{language === 'es' ? "Centro SOS" : "SOS Center"}</span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;
