import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistDashboard.css";

function SpecialistDashboard() {
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [conversationsLoading, setConversationsLoading] =
    useState(true);

  // =====================================================
  // AUTENTICACIÓN + ESPECIALISTA
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setSpecialist(null);
          setConversations([]);
          setLoading(false);

          navigate("/specialist/login");

          return;
        }

        console.log("=================================");
        console.log("SPECIALIST DASHBOARD");
        console.log("UID:", user.uid);
        console.log("EMAIL:", user.email);
        console.log("=================================");

        try {
          const specialistRef = doc(
            db,
            "specialists",
            user.uid
          );

          const specialistSnap = await getDoc(
            specialistRef
          );

          if (!specialistSnap.exists()) {
            console.error(
              "No existe perfil de especialista."
            );

            await signOut(auth);

            navigate("/specialist/login");

            return;
          }

          const specialistData =
            specialistSnap.data();

          console.log(
            "Especialista encontrado:",
            specialistData
          );

          setSpecialist({
            uid: user.uid,
            ...specialistData,
          });
        } catch (error) {
          console.error(
            "Error obteniendo especialista:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // CARGAR CONVERSACIONES DEL ESPECIALISTA
  // =====================================================

  useEffect(() => {
    if (!specialist?.uid) {
      return;
    }

    console.log("=================================");
    console.log("BUSCANDO CONVERSACIONES DEL DASHBOARD");
    console.log(
      "Especialista:",
      specialist.uid
    );
    console.log("=================================");

    setConversationsLoading(true);

    const conversationsRef = collection(
      db,
      "conversaciones_especialistas"
    );

    const conversationsQuery = query(
      conversationsRef,
      where(
        "especialistaId",
        "==",
        specialist.uid
      )
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        console.log(
          "CONVERSACIONES DEL DASHBOARD:",
          snapshot.size
        );

        const data = snapshot.docs.map(
          (conversationDoc) => ({
            id: conversationDoc.id,
            ...conversationDoc.data(),
          })
        );

        // =================================================
        // ORDENAR POR ÚLTIMO MENSAJE
        // =================================================

        data.sort((a, b) => {
          const fechaA =
            a.fechaUltimoMensaje?.toDate
              ? a.fechaUltimoMensaje
                  .toDate()
                  .getTime()
              : 0;

          const fechaB =
            b.fechaUltimoMensaje?.toDate
              ? b.fechaUltimoMensaje
                  .toDate()
                  .getTime()
              : 0;

          return fechaB - fechaA;
        });

        console.log(
          "LISTA DASHBOARD:",
          data
        );

        setConversations(data);
        setConversationsLoading(false);
      },
      (error) => {
        console.error(
          "Error cargando conversaciones del dashboard:",
          error
        );

        setConversationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [specialist?.uid]);

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/specialist/login");
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  };

  // =====================================================
  // ABRIR CONVERSACIÓN
  // =====================================================

  const openConversation = (conversation) => {
    console.log(
      "Abriendo conversación desde Dashboard:",
      conversation
    );

    navigate("/specialist-chat", {
      state: {
        conversation,
      },
    });
  };

  // =====================================================
  // FORMATEAR HORA
  // =====================================================

  const formatTime = (timestamp) => {
    if (
      !timestamp ||
      !timestamp.toDate
    ) {
      return "";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleTimeString(
          "es-NI",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
    } catch {
      return "";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="specialist-loading">
        <div className="loading-spinner"></div>

        <p>
          Cargando tu espacio profesional...
        </p>
      </div>
    );
  }

  if (!specialist) {
    return null;
  }

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const totalConversations =
    conversations.length;

  const totalUsers =
    new Set(
      conversations
        .map(
          (conversation) =>
            conversation.usuarioId
        )
        .filter(Boolean)
    ).size;

  const totalUnread =
    conversations.reduce(
      (total, conversation) =>
        total +
        Number(
          conversation.mensajesNoLeidos || 0
        ),
      0
    );

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="specialist-sidebar">

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

        <nav className="specialist-nav">

          <button
            className="nav-item active"
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                "/specialist/messages"
              )
            }
          >
            <span>💬</span>

            Mensajes

            {totalUnread > 0 ? (
              <small>
                {totalUnread}
              </small>
            ) : (
              <small>
                {totalConversations}
              </small>
            )}

          </button>

          <button
            className="nav-item"
          >
            <span>👥</span>
            Usuarios
          </button>

          <button
            className="nav-item"
          >
            <span>📅</span>
            Agenda
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                "/specialist/profile"
              )
            }
          >
            <span>👤</span>
            Mi perfil
          </button>

          <button
            className="nav-item"
          >
            <span>⚙</span>
            Configuración
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="specialist-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="specialist-header">

          <div>

            <span className="header-small">
              PANEL PROFESIONAL
            </span>

            <h1>
              Buenos días,{" "}
              {
                specialist.nombre
                  ?.split(" ")[0]
              } 👋
            </h1>

            <p>
              Aquí tienes un resumen de tu
              actividad en FeelSafe.
            </p>

          </div>

          <div className="header-profile">

            <div className="header-status">

              <span></span>

              Disponible

            </div>

            <div className="specialist-avatar">

              {specialist.fotoPerfil ? (
                <img
                  src={
                    specialist.fotoPerfil
                  }
                  alt={
                    specialist.nombre
                  }
                />
              ) : (
                specialist.nombre
                  ?.charAt(0)
                  .toUpperCase()
              )}

            </div>

          </div>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="specialist-stats">

          {/* CONVERSACIONES */}

          <div className="stat-card">

            <div className="stat-icon purple">
              💬
            </div>

            <div>

              <span>
                Conversaciones
              </span>

              <strong>
                {totalConversations}
              </strong>

              <small>
                {totalConversations === 0
                  ? "Sin conversaciones todavía"
                  : totalConversations === 1
                  ? "1 conversación activa"
                  : `${totalConversations} conversaciones activas`}
              </small>

            </div>

          </div>

          {/* USUARIOS */}

          <div className="stat-card">

            <div className="stat-icon blue">
              👥
            </div>

            <div>

              <span>
                Usuarios
              </span>

              <strong>
                {totalUsers}
              </strong>

              <small>
                {totalUsers === 0
                  ? "Sin usuarios atendidos"
                  : totalUsers === 1
                  ? "1 usuario atendido"
                  : `${totalUsers} usuarios atendidos`}
              </small>

            </div>

          </div>

          {/* ESTADO */}

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Estado
              </span>

              <strong>
                Activo
              </strong>

              <small>
                Tu cuenta está activa
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="specialist-content-grid">

          {/* PERFIL */}

          <div className="welcome-card">

            <div>

              <span>
                TU PERFIL PROFESIONAL
              </span>

              <h2>
                {specialist.especialidad}
              </h2>

              <p>
                {specialist.descripcion ||
                  "Completa tu descripción profesional para que los usuarios conozcan más sobre ti."}
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/specialist/profile"
                  )
                }
              >
                Ver mi perfil →
              </button>

            </div>

            <div className="welcome-decoration">
              ✦
            </div>

          </div>

          {/* =================================================
              CONVERSACIONES RECIENTES
          ================================================= */}

          <div className="recent-card">

            <div className="recent-header">

              <div>

                <span>
                  ACTIVIDAD
                </span>

                <h2>
                  Conversaciones recientes
                </h2>

              </div>

              <button
                onClick={() =>
                  navigate(
                    "/specialist/messages"
                  )
                }
              >
                Ver todas
              </button>

            </div>

            {/* CARGANDO */}

            {conversationsLoading ? (

              <div className="empty-conversations">

                <div className="empty-icon">
                  ⏳
                </div>

                <h3>
                  Cargando conversaciones...
                </h3>

                <p>
                  Estamos buscando tus conversaciones.
                </p>

              </div>

            ) : conversations.length === 0 ? (

              /* SIN CONVERSACIONES */

              <div className="empty-conversations">

                <div className="empty-icon">
                  💬
                </div>

                <h3>
                  No hay conversaciones todavía
                </h3>

                <p>
                  Cuando un usuario te escriba,
                  aparecerá aquí.
                </p>

              </div>

            ) : (

              /* LISTA */

              <div className="dashboard-conversations">

                {conversations
                  .slice(0, 4)
                  .map(
                    (conversation) => (

                      <div
                        key={
                          conversation.id
                        }
                        className="dashboard-conversation"
                        onClick={() =>
                          openConversation(
                            conversation
                          )
                        }
                      >

                        {/* AVATAR */}

                        <div className="dashboard-conversation-avatar">

                          {conversation.usuarioFoto ? (

                            <img
                              src={
                                conversation.usuarioFoto
                              }
                              alt={
                                conversation.usuarioNombre ||
                                "Usuario"
                              }
                            />

                          ) : (

                            <span>
                              👤
                            </span>

                          )}

                        </div>

                        {/* CONTENIDO */}

                        <div className="dashboard-conversation-content">

                          <div className="dashboard-conversation-top">

                            <strong>
                              {
                                conversation.usuarioNombre ||
                                "Usuario"
                              }
                            </strong>

                            <span>
                              {formatTime(
                                conversation.fechaUltimoMensaje
                              )}
                            </span>

                          </div>

                          <div className="dashboard-conversation-bottom">

                            <p>
                              {
                                conversation.ultimoMensaje ||
                                "Nueva conversación"
                              }
                            </p>

                            {conversation.mensajesNoLeidos >
                              0 && (

                              <span className="dashboard-unread">

                                {
                                  conversation.mensajesNoLeidos
                                }

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default SpecialistDashboard;