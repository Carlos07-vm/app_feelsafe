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


/* =========================================================
   ICONOS
   ========================================================= */

function Icon({ name, size = 20 }) {
  const icons = {
    home: (
      <>
        <path
          d="M3 10.5 12 3l9 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 9.5V20h13V9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 20v-5.5h5V20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </>
    ),

    message: (
      <>
        <path
          d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-5.5A7.5 7.5 0 0 1 10.5 4H13a7 7 0 0 1 7 7.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 11h.01M12 11h.01M16 11h.01"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </>
    ),

    users: (
      <>
        <circle
          cx="9"
          cy="8"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 19c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M15 6.5a3 3 0 0 1 0 5.8M16 14c2.4.4 3.8 2 4.3 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),

    calendar: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M7 3v4M17 3v4M3 10h18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),

    user: (
      <>
        <circle
          cx="12"
          cy="8"
          r="3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M5 21c.6-4.1 2.9-6.2 7-6.2s6.4 2.1 7 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),

    settings: (
      <>
        <circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.5h.1A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.5 1.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </>
    ),

    more: (
      <>
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </>
    ),

    logout: (
      <>
        <path
          d="M10 5H5v14h5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 8l4 4-4 4M17 12H9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),

    close: (
      <>
        <path
          d="M6 6l12 12M18 6 6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),

    chat: (
      <>
        <path
          d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}


/* =========================================================
   SPECIALIST DASHBOARD
   ========================================================= */

function SpecialistDashboard() {
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] =
    useState(true);

  const [showMoreMenu, setShowMoreMenu] = useState(false);


  /* =======================================================
     AUTENTICACIÓN + PERFIL
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!mounted) return;

        if (!user) {
          setSpecialist(null);
          setConversations([]);
          setLoading(false);

          navigate("/specialist/login", {
            replace: true,
          });

          return;
        }

        try {
          const specialistRef = doc(
            db,
            "specialists",
            user.uid
          );

          const specialistSnap =
            await getDoc(specialistRef);

          if (!mounted) return;

          if (!specialistSnap.exists()) {
            console.error(
              "No existe el perfil del especialista."
            );

            await signOut(auth);

            navigate("/specialist/login", {
              replace: true,
            });

            return;
          }

          const specialistData =
            specialistSnap.data();

          setSpecialist({
            uid: user.uid,
            ...specialistData,
          });
        } catch (error) {
          console.error(
            "Error obteniendo especialista:",
            error
          );

          if (mounted) {
            setSpecialist(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [navigate]);


  /* =======================================================
     CONVERSACIONES
     ======================================================= */

  useEffect(() => {
    if (!specialist?.uid) {
      setConversations([]);
      setConversationsLoading(false);
      return;
    }

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
        const data = snapshot.docs.map(
          (conversationDoc) => ({
            id: conversationDoc.id,
            ...conversationDoc.data(),
          })
        );

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

        setConversations(data);
        setConversationsLoading(false);
      },
      (error) => {
        console.error(
          "Error cargando conversaciones:",
          error
        );

        setConversations([]);
        setConversationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [specialist?.uid]);


  /* =======================================================
     CERRAR SESIÓN
     ======================================================= */

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setSpecialist(null);
      setConversations([]);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  };


  /* =======================================================
     ABRIR CONVERSACIÓN
     ======================================================= */

  const openConversation = (conversation) => {
    navigate(
      `/specialist-chat/${conversation.id}`,
      {
        state: {
          conversation,
        },
      }
    );
  };


  /* =======================================================
     HORA
     ======================================================= */

  const formatTime = (timestamp) => {
    if (
      !timestamp ||
      typeof timestamp.toDate !== "function"
    ) {
      return "";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleTimeString("es-NI", {
          hour: "2-digit",
          minute: "2-digit",
        });
    } catch {
      return "";
    }
  };


  /* =======================================================
     LOADING
     ======================================================= */

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


  /* =======================================================
     ESTADÍSTICAS
     ======================================================= */

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


  /* =======================================================
     NAVEGACIÓN
     ======================================================= */

  const goTo = (path) => {
    setShowMoreMenu(false);
    navigate(path);
  };


  /* =======================================================
     INTERFAZ
     ======================================================= */

  return (
    <div className="specialist-dashboard">


      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside className="specialist-sidebar">

        {/* LOGO */}

        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">
            <img src="logo.jpeg" alt="" />
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


        {/* NAVEGACIÓN PRINCIPAL */}

        <nav className="specialist-nav">

          <button
            type="button"
            className="nav-item active"
            onClick={() =>
              goTo(
                "/specialist/dashboard"
              )
            }
          >
            <span>
              <Icon name="home" />
            </span>

            Inicio
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() =>
              goTo(
                "/specialist/messages"
              )
            }
          >
            <span>
              <Icon name="message" />
            </span>

            Mensajes

            <small>
              {totalUnread > 0
                ? totalUnread
                : totalConversations}
            </small>
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() =>
              goTo(
                "/specialist/users"
              )
            }
          >
            <span>
              <Icon name="users" />
            </span>

            Usuarios
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() =>
              goTo(
                "/specialist/agenda"
              )
            }
          >
            <span>
              <Icon name="calendar" />
            </span>

            Agenda
          </button>
          
          <button
          type="button"
          className="nav-item mobile-more-button"
          onClick={() => setShowMoreMenu(true)}
        >
          <span>
            <Icon name="more" />
          </span>

          Más
        </button>
          

        </nav>


        {/* PARTE INFERIOR */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="nav-item"
            onClick={() =>
              goTo(
                "/specialist/profile"
              )
            }
          >
            <span>
              <Icon name="user" />
            </span>

            Mi perfil
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() =>
              goTo(
                "/specialist/settings"
              )
            }
          >
            <span>
              <Icon name="settings" />
            </span>

            Configuración
          </button>


          <button
            type="button"
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>
              <Icon name="logout" />
            </span>

            Cerrar sesión
          </button>

        </div>

      </aside>


      {/* ===================================================
          CONTENIDO PRINCIPAL
          =================================================== */}

      <main className="specialist-main">


        {/* HEADER */}

        <header className="specialist-header">

          <div>

            <span className="header-small">
              Panel profesional
            </span>

            <h1>
              Buenos días,{" "}
              {specialist.nombre
                ?.split(" ")[0] ||
                "Especialista"}{" "}
              👋
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


            <button
              type="button"
              className="specialist-avatar"
              onClick={() =>
                goTo(
                  "/specialist/profile"
                )
              }
              title="Ver perfil"
            >

              {specialist.fotoPerfil ? (
                <img
                  src={
                    specialist.fotoPerfil
                  }
                  alt={
                    specialist.nombre ||
                    "Especialista"
                  }
                />
              ) : (
                specialist.nombre
                  ?.charAt(0)
                  .toUpperCase() ||
                "E"
              )}

            </button>

          </div>

        </header>


        {/* =================================================
            ESTADÍSTICAS
            ================================================= */}

        <section className="specialist-stats">


          <div className="stat-card">

            <div className="stat-icon purple">
              <Icon
                name="message"
                size={21}
              />
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


          <div className="stat-card">

            <div className="stat-icon blue">
              <Icon
                name="users"
                size={21}
              />
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


          <div className="stat-card">

            <div className="stat-icon green">
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
            </div>

            <div>

              <span>
                Mensajes pendientes
              </span>

              <strong>
                {totalUnread}
              </strong>

              <small>
                {totalUnread === 0
                  ? "Todo al día"
                  : totalUnread === 1
                  ? "1 mensaje sin leer"
                  : `${totalUnread} mensajes sin leer`}
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTENIDO
            ================================================= */}

        <section className="specialist-content-grid">


          {/* PERFIL */}

          <div className="welcome-card">

            <div>

              <span>
                Tu perfil profesional
              </span>

              <h2>
                {specialist.especialidad ||
                  "Especialista FeelSafe"}
              </h2>

              <p>
                {specialist.descripcion ||
                  "Completa tu descripción profesional para que los usuarios conozcan más sobre ti."}
              </p>

              <button
                type="button"
                onClick={() =>
                  goTo(
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


          {/* CONVERSACIONES */}

          <div className="recent-card">

            <div className="recent-header">

              <div>

                <span>
                  Actividad
                </span>

                <h2>
                  Conversaciones recientes
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
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
                  <Icon
                    name="message"
                    size={24}
                  />
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
                  <Icon
                    name="chat"
                    size={24}
                  />
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
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {

                          if (
                            event.key ===
                              "Enter" ||
                            event.key === " "
                          ) {
                            openConversation(
                              conversation
                            );
                          }

                        }}
                      >

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

                            <Icon
                              name="user"
                              size={19}
                            />

                          )}

                        </div>


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


      {/* ===================================================
          MENÚ MÓVIL "MÁS"
          =================================================== */}

      {showMoreMenu && (

        <div
          className="mobile-more-overlay"
          onClick={() =>
            setShowMoreMenu(false)
          }
        >

          <div
            className="mobile-more-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mobile-more-header">

              <div>
                <span>
                  CUENTA
                </span>

                <h3>
                  Más opciones
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMoreMenu(false)
                }
              >
                <Icon
                  name="close"
                  size={19}
                />
              </button>

            </div>


            <button
              type="button"
              onClick={() =>
                goTo(
                  "/specialist/profile"
                )
              }
            >
              <Icon
                name="user"
                size={19}
              />

              <span>
                Mi perfil
              </span>
            </button>


            <button
              type="button"
              onClick={() =>
                goTo(
                  "/specialist/settings"
                )
              }
            >
              <Icon
                name="settings"
                size={19}
              />

              <span>
                Configuración
              </span>
            </button>


            <button
              type="button"
              className="mobile-more-logout"
              onClick={handleLogout}
            >
              <Icon
                name="logout"
                size={19}
              />

              <span>
                Cerrar sesión
              </span>
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default SpecialistDashboard;