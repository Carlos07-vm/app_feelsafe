import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistDashboard.css";

function SpecialistSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [totalUnread, setTotalUnread] = useState(0);

  // =====================================================
  // MENSAJES NO LEÍDOS
  // =====================================================

  useEffect(() => {
    let unsubscribeConversations = null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!firebaseUser) {
            setTotalUnread(0);
            return;
          }

          const conversationsRef =
            collection(
              db,
              "conversaciones_especialistas"
            );

          const conversationsQuery =
            query(
              conversationsRef,
              where(
                "especialistaId",
                "==",
                firebaseUser.uid
              )
            );

          unsubscribeConversations =
            onSnapshot(
              conversationsQuery,
              (snapshot) => {
                const total =
                  snapshot.docs.reduce(
                    (sum, conversationDoc) => {
                      const data =
                        conversationDoc.data();

                      return (
                        sum +
                        Number(
                          data.mensajesNoLeidos ||
                            0
                        )
                      );
                    },
                    0
                  );

                setTotalUnread(total);
              },
              (error) => {
                console.error(
                  "Error cargando mensajes no leídos:",
                  error
                );

                setTotalUnread(0);
              }
            );
        }
      );

    return () => {
      unsubscribeAuth();

      if (unsubscribeConversations) {
        unsubscribeConversations();
      }
    };
  }, []);

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate(
        "/specialist/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  };

  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  const goTo = (path) => {
    navigate(path);
  };

  // =====================================================
  // DETERMINAR SECCIÓN ACTIVA
  // =====================================================

  const isDashboard =
    location.pathname ===
    "/specialist/dashboard";

  const isMessages =
    location.pathname ===
      "/specialist/messages" ||
    location.pathname ===
      "/specialist-conversations" ||
    location.pathname.startsWith(
      "/specialist-chat/"
    );

  const isProfile =
    location.pathname ===
    "/specialist/profile";

  const isUsers =
    location.pathname.startsWith(
      "/specialist/users"
    );

  const isAgenda =
    location.pathname.startsWith(
      "/specialist/agenda"
    );

  const isSettings =
    location.pathname.startsWith(
      "/specialist/settings"
    );

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <aside className="specialist-sidebar">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="sidebar-logo">

        <div className="sidebar-logo-icon">
          ♡
        </div>

        <div>
          <strong>
            FeelSafe
          </strong>

          <span>
            Especialistas
          </span>
        </div>

      </div>

      {/* =================================================
          NAVEGACIÓN PRINCIPAL
      ================================================= */}

      <nav className="specialist-nav">

        {/* INICIO */}

        <button
          type="button"
          className={`nav-item ${
            isDashboard
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/dashboard"
            )
          }
        >
          <span>⌂</span>

          Inicio
        </button>

        {/* MENSAJES */}

        <button
          type="button"
          className={`nav-item ${
            isMessages
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/messages"
            )
          }
        >
          <span>💬</span>

          Mensajes

          {totalUnread > 0 && (
            <small>
              {totalUnread}
            </small>
          )}
        </button>

        {/* USUARIOS */}

        <button
          type="button"
          className={`nav-item ${
            isUsers
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/users"
            )
          }
        >
          <span>👥</span>

          Usuarios
        </button>

        {/* AGENDA */}

        <button
          type="button"
          className={`nav-item ${
            isAgenda
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/agenda"
            )
          }
        >
          <span>📅</span>

          Agenda
        </button>

      </nav>

      {/* =================================================
          PARTE INFERIOR
      ================================================= */}

      <div className="sidebar-bottom">

        {/* PERFIL */}

        <button
          type="button"
          className={`nav-item ${
            isProfile
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/profile"
            )
          }
        >
          <span>👤</span>

          Mi perfil
        </button>

        {/* CONFIGURACIÓN */}

        <button
          type="button"
          className={`nav-item ${
            isSettings
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo(
              "/specialist/settings"
            )
          }
        >
          <span>⚙</span>

          Configuración
        </button>

        {/* CERRAR SESIÓN */}

        <button
          type="button"
          className="nav-item logout"
          onClick={
            handleLogout
          }
        >
          <span>↪</span>

          Cerrar sesión
        </button>

      </div>

    </aside>
  );
}

export default SpecialistSidebar;