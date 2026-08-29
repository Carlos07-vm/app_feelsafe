import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import {
  FaHome,
  FaComments,
  FaUsers,
  FaCalendarAlt,
  FaUserMd,
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCircle,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import logo from "../assets/logo.jpeg";
import "../styles/SpecialistLayout.css";

function SpecialistLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [specialist, setSpecialist] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // =====================================================
  // AUTENTICACIÓN Y DATOS DEL ESPECIALISTA
  // =====================================================
  useEffect(() => {
    let unsubscribeConversations = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSpecialist(null);
        setUnreadCount(0);
        navigate("/login", { replace: true });
        return;
      }

      // Cargar datos del perfil del especialista
      try {
        const specialistRef = doc(db, "specialists", user.uid);
        const specialistSnap = await getDoc(specialistRef);
        if (specialistSnap.exists()) {
          setSpecialist({ uid: user.uid, email: user.email, ...specialistSnap.data() });
        } else {
          setSpecialist({
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || "Especialista",
            especialidad: "Profesional FeelSafe",
            fotoPerfil: user.photoURL || "",
          });
        }
      } catch (err) {
        console.error("Error cargando especialista en layout:", err);
        setSpecialist({
          uid: user.uid,
          email: user.email,
          nombre: user.displayName || "Especialista",
          especialidad: "Profesional",
        });
      }

      // Escuchar mensajes no leídos en tiempo real
      const conversationsRef = collection(db, "conversaciones_especialistas");
      const conversationsQuery = query(
        conversationsRef,
        where("especialistaId", "==", user.uid)
      );

      unsubscribeConversations = onSnapshot(
        conversationsQuery,
        (snapshot) => {
          const total = snapshot.docs.reduce((sum, docItem) => {
            const data = docItem.data();
            return sum + Number(data.mensajesNoLeidos || 0);
          }, 0);
          setUnreadCount(total);
        },
        (error) => {
          console.error("Error cargando no leídos:", error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeConversations) unsubscribeConversations();
    };
  }, [navigate]);

  // =====================================================
  // CERRAR MENÚ EN CAMBIO DE RUTA
  // =====================================================
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================
  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      setLoggingOut(false);
    }
  };

  const navPrincipal = [
    {
      to: "/specialist/dashboard",
      icon: <FaHome />,
      label: "Inicio",
    },
    {
      to: "/specialist/messages",
      icon: <FaComments />,
      label: "Mensajes",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      to: "/specialist/users",
      icon: <FaUsers />,
      label: "Pacientes",
    },
    {
      to: "/specialist/agenda",
      icon: <FaCalendarAlt />,
      label: "Agenda",
    },
  ];

  const navCuenta = [
    {
      to: "/specialist/profile",
      icon: <FaUserMd />,
      label: "Mi Perfil",
    },
    {
      to: "/specialist/settings",
      icon: <FaUserCog />,
      label: "Configuración",
    },
  ];

  return (
    <div className={`specialist-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="specialist-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {/* =================================================
          SIDEBAR DEL ESPECIALISTA (Idéntico estilo FeelSafe)
      ================================================= */}
      <aside className={`specialist-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Botón cerrar en móvil */}
        <div className="specialist-sidebar-close">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <FaTimes />
          </button>
        </div>

        {/* Logo */}
        <div className="specialist-sidebar-logo" onClick={() => navigate("/specialist/dashboard")}>
          <img src={logo} alt="FeelSafe Logo" />
          <h2>FeelSafe</h2>
          <span className="specialist-badge-brand">Panel Profesional</span>
        </div>

        {/* Info del Especialista */}
        <div className="specialist-sidebar-user">
          <div className="specialist-avatar-wrap">
            {specialist?.fotoPerfil ? (
              <img
                src={specialist.fotoPerfil}
                alt={specialist.nombre || "Especialista"}
                className="specialist-user-image"
              />
            ) : (
              <FaUserCircle className="specialist-user-icon" />
            )}
            <span className="specialist-status-dot" title="Disponible">
              <FaCircle />
            </span>
          </div>

          <h3 className="specialist-user-name">
            {specialist?.nombre || "Especialista"}
          </h3>
          <p className="specialist-user-specialty">
            {specialist?.especialidad || "Especialista"}
          </p>
        </div>

        {/* Menú de Navegación */}
        <nav className="specialist-sidebar-menu">
          <p className="specialist-menu-title">Principal</p>

          {navPrincipal.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `specialist-menu-item ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="specialist-menu-icon">{item.icon}</span>
              <span className="specialist-menu-text">{item.label}</span>
              {item.badge && (
                <span className="specialist-menu-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}

          <p className="specialist-menu-title">Cuenta</p>

          {navCuenta.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `specialist-menu-item ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="specialist-menu-icon">{item.icon}</span>
              <span className="specialist-menu-text">{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            className="specialist-menu-item specialist-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span className="specialist-menu-icon">
              <FaSignOutAlt />
            </span>
            <span className="specialist-menu-text">
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </span>
          </button>
        </nav>
      </aside>

      {/* =================================================
          CONTENIDO PRINCIPAL
      ================================================= */}
      <div className="specialist-main-wrapper">
        {/* Topbar móvil / responsive */}
        <header className="specialist-topbar">
          <button
            className="specialist-mobile-toggle"
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Abrir menú"
          >
            <FaBars />
          </button>

          <div className="specialist-topbar-title">
            <span>FeelSafe</span> Especialistas
          </div>

          <div
            className="specialist-topbar-user"
            onClick={() => navigate("/specialist/profile")}
          >
            {specialist?.fotoPerfil ? (
              <img
                src={specialist.fotoPerfil}
                alt={specialist.nombre || "Especialista"}
                className="specialist-topbar-avatar"
              />
            ) : (
              <div className="specialist-topbar-avatar-placeholder">
                {(specialist?.nombre || "E").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="specialist-topbar-name">
              {specialist?.nombre?.split(" ")[0] || "Especialista"}
            </span>
          </div>
        </header>

        {/* Renderizado de pantalla */}
        <main className="specialist-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SpecialistLayout;