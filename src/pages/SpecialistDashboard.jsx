import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  FaComments,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowRight,
  FaUserMd,
  FaClock,
  FaCommentDots,
  FaCalendarPlus,
  FaUserCircle,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import SpecialistLayout from "../components/SpecialistLayout";
import "../styles/SpecialistDashboard.css";

function SpecialistDashboard() {
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);
  // =======================================================
  // 1. AUTENTICACIÓN
  // =======================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSpecialist(null);
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const specialistRef = doc(db, "specialists", user.uid);
        const specialistSnap = await getDoc(specialistRef);

        if (specialistSnap.exists()) {
          setSpecialist({
            uid: user.uid,
            email: user.email,
            ...specialistSnap.data(),
          });
        } else {
          setSpecialist({
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || "Especialista",
            especialidad: "Profesional FeelSafe",
            disponible: true,
          });
        }
      } catch (error) {
        console.error("Error cargando perfil del especialista:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =======================================================
// 2. CONVERSACIONES EN TIEMPO REAL
// =======================================================
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
    where("especialistaId", "==", specialist.uid)
  );

  const unsubscribe = onSnapshot(
    conversationsQuery,
    (snapshot) => {
      try {
        // ===================================================
        // 1. OBTENER CONVERSACIONES
        // ===================================================

        const loadedConversations = snapshot.docs
          .map((conversationDoc) => ({
            id: conversationDoc.id,
            ...conversationDoc.data(),
          }))
          .filter((conversation) => {
            const usuarioId = conversation.usuarioId;

            // No mostrar conversaciones sin usuario
            if (!usuarioId) {
              return false;
            }

            // No mostrar al propio especialista
            if (usuarioId === specialist.uid) {
              return false;
            }

            return true;
          });

        // ===================================================
        // 2. ORDENAR POR ÚLTIMO MENSAJE
        // ===================================================

        loadedConversations.sort((a, b) => {
          const timeA =
            a.fechaUltimoMensaje?.toMillis
              ? a.fechaUltimoMensaje.toMillis()
              : 0;

          const timeB =
            b.fechaUltimoMensaje?.toMillis
              ? b.fechaUltimoMensaje.toMillis()
              : 0;

          return timeB - timeA;
        });

        // ===================================================
        // 3. ELIMINAR USUARIOS REPETIDOS
        // ===================================================
        //
        // Si existen varias conversaciones para el mismo
        // usuario, solamente conservamos la más reciente.
        //

        const usersSeen = new Set();

        const uniqueConversations = loadedConversations.filter(
          (conversation) => {
            const usuarioId = conversation.usuarioId;

            if (usersSeen.has(usuarioId)) {
              return false;
            }

            usersSeen.add(usuarioId);
            return true;
          }
        );

        // ===================================================
// ACTUALIZAR CONTADORES
// ===================================================

const uniqueUsers = new Set(
  uniqueConversations
    .map((conversation) => conversation.usuarioId)
    .filter(
      (usuarioId) =>
        usuarioId && usuarioId !== specialist.uid
    )
);

const unreadCount = uniqueConversations.reduce(
  (total, conversation) => {
    return total + Number(
      conversation.mensajesNoLeidos || 0
    );
  },
  0
);

        setTotalConversations(uniqueConversations.length);
        setTotalUsers(uniqueUsers.size);
        setTotalUnread(unreadCount);

        // ===================================================
        // 4. DEBUG
        // ===================================================

        console.log(
          "💬 Conversaciones encontradas:",
          snapshot.docs.length
        );

        console.log(
          "🚫 Conversaciones del especialista excluidas:",
          snapshot.docs.filter(
            (doc) =>
              doc.data().usuarioId === specialist.uid
          ).length
        );

        console.log(
          "👥 Usuarios únicos:",
          uniqueConversations.length
        );

        // ===================================================
        // 5. ACTUALIZAR ESTADO
        // ===================================================

        setConversations(uniqueConversations);
      } catch (error) {
        console.error(
          "❌ Error procesando conversaciones:",
          error
        );

        setConversations([]);
      } finally {
        setConversationsLoading(false);
      }
    },
    (error) => {
      console.error(
        "❌ Error escuchando conversaciones:",
        error
      );

      setConversations([]);
      setConversationsLoading(false);
    }
  );

  return () => unsubscribe();
}, [specialist?.uid]);

  // =======================================================
  // 3. CITAS EN TIEMPO REAL
  // =======================================================
  useEffect(() => {
    if (!specialist?.uid) return;

    const appointmentsRef = collection(db, "citas_especialistas");
    const appointmentsQuery = query(
      appointmentsRef,
      where("especialistaId", "==", specialist.uid)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        setAppointmentsCount(snapshot.size);
      },
      (error) => {
        console.error("Error cargando citas:", error);
      }
    );

    return () => unsubscribe();
  }, [specialist?.uid]);

  // =======================================================
  // ABRIR CONVERSACIÓN
  // =======================================================
  const openConversation = (conversation) => {
    navigate(`/specialist-chat/${conversation.id}`, {
      state: { conversation },
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== "function") {
      return "";
    }
    try {
      return timestamp.toDate().toLocaleTimeString("es-NI", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };


  if (loading) {
    return (
      <SpecialistLayout>
        <div className="specialist-loading-view">
          <div className="specialist-spinner"></div>
          <p>Cargando tu espacio profesional...</p>
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="specialist-dashboard-wrapper">
        {/* ===================================================
            HERO PRINCIPAL (Estilo FeelSafe)
            =================================================== */}
        <section className="specialist-hero-solid">
          <div className="specialist-hero-content">
            <div className="specialist-hero-badge">
              <span>{specialist?.especialidad || "Especialista FeelSafe"}</span>
              <span className="specialist-hero-dot">•</span>
              <span className="specialist-hero-status">
                {specialist?.disponible !== false ? "Disponible" : "Ausente"}
              </span>
            </div>

            <h1 className="specialist-hero-title">
              Hola, {specialist?.nombre || "Especialista"} 👋
            </h1>

            <p className="specialist-hero-subtitle">
              Bienvenido a tu panel profesional. Aquí puedes acompañar y atender a los usuarios de FeelSafe con calidez y seguridad.
            </p>

            <div className="specialist-hero-actions">
              <button
                type="button"
                className="hero-btn-primary"
                onClick={() => navigate("/specialist/messages")}
              >
                <FaComments /> Ver Mensajes
              </button>
              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => navigate("/specialist/agenda")}
              >
                <FaCalendarPlus /> Agendar Cita
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            MÉTRICAS Y ESTADÍSTICAS
            =================================================== */}
        <section className="specialist-stats-grid">
          {/* Card 1: Mensajes no leídos */}
          <div
            className="specialist-stat-card"
            onClick={() => navigate("/specialist/messages")}
          >
            <div className="stat-card-top">
              <span className="stat-label">Mensajes Pendientes</span>
              <div className="stat-icon-bubble red">
                <FaCommentDots />
              </div>
            </div>
            <div className="stat-number">{totalUnread}</div>
            <div className="stat-hint">
              {totalUnread === 0
                ? "✓ Estás al día con todos tus mensajes"
                : `${totalUnread} ${totalUnread === 1 ? "mensaje por responder" : "mensajes por responder"}`}
            </div>
          </div>

          {/* Card 2: Conversaciones */}
          <div
            className="specialist-stat-card"
            onClick={() => navigate("/specialist/messages")}
          >
            <div className="stat-card-top">
              <span className="stat-label">Conversaciones Activas</span>
              <div className="stat-icon-bubble purple">
                <FaComments />
              </div>
            </div>
            <div className="stat-number">{totalConversations}</div>
            <div className="stat-hint">
              {totalConversations === 0
                ? "Sin chats iniciados aún"
                : `${totalConversations} ${totalConversations === 1 ? "chat en curso" : "chats en curso"}`}
            </div>
          </div>

          {/* Card 3: Pacientes */}
          <div
            className="specialist-stat-card"
            onClick={() => navigate("/specialist/users")}
          >
            <div className="stat-card-top">
              <span className="stat-label">Pacientes Atendidos</span>
              <div className="stat-icon-bubble blue">
                <FaUsers />
              </div>
            </div>
            <div className="stat-number">{totalUsers}</div>
            <div className="stat-hint">
              {totalUsers === 0
                ? "Esperando nuevas consultas"
                : `${totalUsers} ${totalUsers === 1 ? "usuario acompañado" : "usuarios acompañados"}`}
            </div>
          </div>

          {/* Card 4: Citas */}
          <div
            className="specialist-stat-card"
            onClick={() => navigate("/specialist/agenda")}
          >
            <div className="stat-card-top">
              <span className="stat-label">Citas en Agenda</span>
              <div className="stat-icon-bubble green">
                <FaCalendarAlt />
              </div>
            </div>
            <div className="stat-number">{appointmentsCount}</div>
            <div className="stat-hint">
              {appointmentsCount === 0
                ? "Agenda disponible"
                : `${appointmentsCount} consultas registradas`}
            </div>
          </div>
        </section>

        {/* ===================================================
            GRID PRINCIPAL: CONVERSACIONES + ACCIONES
            =================================================== */}
        <section className="specialist-dashboard-grid">
          {/* Lado Izquierdo: Conversaciones recientes */}
          <div className="dashboard-card recent-conversations-card">
            <div className="dashboard-card-header">
              <div>
                <h2 className="dashboard-card-title">Conversaciones Recientes</h2>
                <p className="dashboard-card-subtitle">
                  Pacientes y usuarios que se han comunicado contigo recientemente.
                </p>
              </div>
              <button
                type="button"
                className="dashboard-link-btn"
                onClick={() => navigate("/specialist/messages")}
              >
                Ver todas <FaArrowRight />
              </button>
            </div>

            {conversationsLoading ? (
              <div className="dashboard-empty-state">
                <div className="specialist-spinner-small"></div>
                <p>Cargando conversaciones...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="dashboard-empty-state">
                <div className="empty-icon-wrap">
                  <FaComments />
                </div>
                <h3>No hay conversaciones todavía</h3>
                <p>
                  Cuando un usuario inicie un chat contigo, aparecerá en este listado para que puedas responderle de inmediato.
                </p>
              </div>
            ) : (
              <div className="recent-conversations-list">
                {conversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="recent-conv-item"
                    onClick={() => openConversation(conv)}
                  >
                    <div className="recent-conv-avatar">
                      {conv.usuarioFoto ? (
                        <img
                          src={conv.usuarioFoto}
                          alt={conv.usuarioNombre || "Usuario"}
                        />
                      ) : (
                        <FaUserCircle className="avatar-placeholder-icon" />
                      )}
                    </div>

                    <div className="recent-conv-details">
                      <div className="recent-conv-top">
                        <span className="recent-conv-name">
                          {conv.usuarioNombre || "Usuario FeelSafe"}
                        </span>
                        <span className="recent-conv-time">
                          <FaClock /> {formatTime(conv.fechaUltimoMensaje) || "Hoy"}
                        </span>
                      </div>

                      <div className="recent-conv-bottom">
                        <p className="recent-conv-snippet">
                          {conv.ultimoMensaje || "Nueva consulta iniciada"}
                        </p>
                        {conv.mensajesNoLeidos > 0 && (
                          <span className="recent-conv-badge">
                            {conv.mensajesNoLeidos}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lado Derecho: Acciones Rápidas y Resumen */}
          <div className="dashboard-sidebar-column">
            {/* Tarjeta Perfil Rápido */}
            <div className="dashboard-card quick-profile-card">
              <div className="quick-profile-header">
                <div className="quick-profile-avatar">
                  {specialist?.fotoPerfil ? (
                    <img
                      src={specialist.fotoPerfil}
                      alt={specialist.nombre || "Especialista"}
                    />
                  ) : (
                    <FaUserMd />
                  )}
                </div>
                <div>
                  <h3 className="quick-profile-name">
                    {specialist?.nombre || "Especialista"}
                  </h3>
                  <p className="quick-profile-spec">
                    {specialist?.especialidad || "Especialista"}
                  </p>
                </div>
              </div>

              <div className="quick-profile-body">
                <p className="quick-profile-desc">
                  {specialist?.descripcion ||
                    "Completa tu perfil profesional para generar mayor confianza con tus pacientes."}
                </p>

                <button
                  type="button"
                  className="quick-action-full-btn"
                  onClick={() => navigate("/specialist/profile")}
                >
                  <FaUserMd /> Editar Perfil Profesional
                </button>
              </div>
            </div>

            {/* Tarjeta de Accesos Rápidos */}
            <div className="dashboard-card quick-actions-card">
              <h3 className="dashboard-card-title">Acciones Directas</h3>
              <div className="quick-actions-list">
                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => navigate("/specialist/agenda")}
                >
                  <div className="quick-action-icon green">
                    <FaCalendarAlt />
                  </div>
                  <div className="quick-action-text">
                    <strong>Gestionar Agenda</strong>
                    <span>Revisar y programar citas</span>
                  </div>
                  <FaArrowRight className="quick-action-arrow" />
                </button>

                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => navigate("/specialist/users")}
                >
                  <div className="quick-action-icon blue">
                    <FaUsers />
                  </div>
                  <div className="quick-action-text">
                    <strong>Directorio de Pacientes</strong>
                    <span>Historial de usuarios atendidos</span>
                  </div>
                  <FaArrowRight className="quick-action-arrow" />
                </button>

                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => navigate("/specialist/settings")}
                >
                  <div className="quick-action-icon purple">
                    <FaCheckCircle />
                  </div>
                  <div className="quick-action-text">
                    <strong>Ajustes y Disponibilidad</strong>
                    <span>Modificar estado activo y alertas</span>
                  </div>
                  <FaArrowRight className="quick-action-arrow" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistDashboard;