import { useState } from "react";
import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";

import { auth } from "../services/firebase";

import "../styles/SpecialistLayout.css";

function SpecialistLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );

      setLoggingOut(false);
    }
  };

  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  const navigationItems = [
    {
      path: "/specialist/dashboard",
      icon: "⌂",
      label: "Inicio",
    },
    {
      path: "/specialist/messages",
      icon: "💬",
      label: "Mensajes",
    },
    {
      path: "/specialist/users",
      icon: "👥",
      label: "Usuarios",
    },
    {
      path: "/specialist/agenda",
      icon: "📅",
      label: "Agenda",
    },
  ];

  const secondaryItems = [
    {
      path: "/specialist/profile",
      icon: "👤",
      label: "Mi perfil",
    },
    {
      path: "/specialist/settings",
      icon: "⚙",
      label: "Configuración",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="specialist-layout-sidebar">

        {/* LOGO */}

        <div className="specialist-layout-logo">

          <div className="specialist-layout-logo-icon">
            ♡
          </div>

          <div className="specialist-layout-logo-text">

            <strong>
              FeelSafe
            </strong>

            <span>
              Especialistas
            </span>

          </div>

        </div>

        {/* NAVEGACIÓN PRINCIPAL */}

        <nav className="specialist-layout-nav">

          <div className="specialist-layout-section-label">
            PRINCIPAL
          </div>

          {navigationItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`specialist-layout-nav-item ${
                isActive(item.path)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.path)
              }
            >

              <span className="specialist-layout-nav-icon">
                {item.icon}
              </span>

              <span className="specialist-layout-nav-label">
                {item.label}
              </span>

            </button>
          ))}

        </nav>

        {/* CUENTA */}

        <div className="specialist-layout-bottom">

          <div className="specialist-layout-section-label">
            CUENTA
          </div>

          {secondaryItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`specialist-layout-nav-item ${
                isActive(item.path)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.path)
              }
            >

              <span className="specialist-layout-nav-icon">
                {item.icon}
              </span>

              <span className="specialist-layout-nav-label">
                {item.label}
              </span>

            </button>
          ))}

          {/* CERRAR SESIÓN */}

          <button
            type="button"
            className="specialist-layout-nav-item specialist-layout-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >

            <span className="specialist-layout-nav-icon">
              ↪
            </span>

            <span className="specialist-layout-nav-label">
              {loggingOut
                ? "Saliendo..."
                : "Cerrar sesión"}
            </span>

          </button>

        </div>

      </aside>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <main className="specialist-layout-main">

        {children}

      </main>

      {/* =================================================
          NAVEGACIÓN MÓVIL
      ================================================= */}

      <nav className="specialist-mobile-nav">

        {navigationItems.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`specialist-mobile-nav-item ${
              isActive(item.path)
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(item.path)
            }
          >

            <span className="specialist-mobile-nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>
        ))}

        <button
          type="button"
          className={`specialist-mobile-nav-item ${
            isActive("/specialist/profile")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/specialist/profile")
          }
        >

          <span className="specialist-mobile-nav-icon">
            👤
          </span>

          <span>
            Perfil
          </span>

        </button>

      </nav>

    </div>
  );
}

export default SpecialistLayout;