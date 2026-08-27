import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FaComments,
  FaSearch,
  FaClock,
  FaUserCircle,
  FaCommentDots,
  FaPaperPlane,
} from "react-icons/fa";

import SpecialistLayout from "../components/SpecialistLayout";
import { db, auth } from "../services/firebase";
import "../styles/SpecialistMessages.css";

function SpecialistMessages() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "unread"

  // =====================================================
  // 1. AUTENTICACIÓN
  // =====================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
      } else {
        setCurrentUser(null);
        setConversations([]);
        setLoading(false);
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // 2. CARGAR CONVERSACIONES EN TIEMPO REAL
  // =====================================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);

    const conversationsRef = collection(db, "conversaciones_especialistas");
    const conversationsQuery = query(
      conversationsRef,
      where("especialistaId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const loadedConversations = snapshot.docs.map((conversationDoc) => ({
          id: conversationDoc.id,
          ...conversationDoc.data(),
        }));

        loadedConversations.sort((a, b) => {
          const timeA = a.fechaUltimoMensaje?.toMillis
            ? a.fechaUltimoMensaje.toMillis()
            : 0;
          const timeB = b.fechaUltimoMensaje?.toMillis
            ? b.fechaUltimoMensaje.toMillis()
            : 0;
          return timeB - timeA;
        });

        setConversations(loadedConversations);
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando conversaciones:", err);
        setConversations([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // FILTRADO Y BÚSQUEDA
  // =====================================================
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        (c.usuarioNombre || "Usuario")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (c.ultimoMensaje || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === "unread") {
        return (c.mensajesNoLeidos || 0) > 0;
      }

      return true;
    });
  }, [conversations, search, filter]);

  const totalUnread = useMemo(() => {
    return conversations.reduce(
      (sum, c) => sum + Number(c.mensajesNoLeidos || 0),
      0
    );
  }, [conversations]);

  // =====================================================
  // ABRIR CONVERSACIÓN
  // =====================================================
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
      const date = timestamp.toDate();
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString("es-NI", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <SpecialistLayout>
      <div className="specialist-messages-wrapper">
        {/* ===================================================
            HEADER DE MENSAJES
            =================================================== */}
        <header className="messages-page-header">
          <div>
            <div className="messages-page-badge">
              <span>Bandeja de Entrada</span>
            </div>
            <h1 className="messages-page-title">Mensajes de Pacientes</h1>
            <p className="messages-page-subtitle">
              Responde las consultas y acompaña en tiempo real a las personas que te han contactado.
            </p>
          </div>

          <div className="messages-counter-card">
            <div className="counter-num">{conversations.length}</div>
            <span className="counter-label">
              {conversations.length === 1 ? "Conversación" : "Conversaciones"}
            </span>
            {totalUnread > 0 && (
              <span className="counter-unread-chip">
                {totalUnread} sin leer
              </span>
            )}
          </div>
        </header>

        {/* ===================================================
            TOOLBAR: BÚSQUEDA Y FILTROS
            =================================================== */}
        <div className="messages-toolbar">
          <div className="messages-search-box">
            <FaSearch className="messages-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre de paciente o mensaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="messages-clear-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="messages-filter-pills">
            <button
              type="button"
              className={`filter-pill ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todas ({conversations.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              No leídas ({conversations.filter((c) => (c.mensajesNoLeidos || 0) > 0).length})
            </button>
          </div>
        </div>

        {/* ===================================================
            LISTA DE CONVERSACIONES
            =================================================== */}
        <main className="messages-list-container">
          {loading ? (
            <div className="messages-loading-state">
              <div className="specialist-spinner"></div>
              <p>Cargando tus mensajes...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="messages-empty-state">
              <div className="messages-empty-icon">
                {search ? <FaSearch /> : <FaComments />}
              </div>
              <h3>
                {search
                  ? "No se encontraron conversaciones"
                  : filter === "unread"
                  ? "No tienes mensajes sin leer"
                  : "Bandeja de entrada vacía"}
              </h3>
              <p>
                {search
                  ? "Intenta buscar con otro nombre de paciente."
                  : filter === "unread"
                  ? "Estás al día con todas las consultas."
                  : "Cuando un usuario inicie un chat contigo, aparecerá en esta lista."}
              </p>
            </div>
          ) : (
            <div className="messages-cards-list">
              {filteredConversations.map((conv) => {
                const hasUnread = (conv.mensajesNoLeidos || 0) > 0;

                return (
                  <article
                    key={conv.id}
                    className={`message-card-item ${hasUnread ? "unread" : ""}`}
                    onClick={() => openConversation(conv)}
                  >
                    <div className="message-card-avatar">
                      {conv.usuarioFoto ? (
                        <img
                          src={conv.usuarioFoto}
                          alt={conv.usuarioNombre || "Usuario"}
                        />
                      ) : (
                        <FaUserCircle className="avatar-icon" />
                      )}
                      {hasUnread && <span className="unread-dot-badge"></span>}
                    </div>

                    <div className="message-card-content">
                      <div className="message-card-top">
                        <h3 className="message-card-name">
                          {conv.usuarioNombre || "Usuario FeelSafe"}
                        </h3>
                        <span className="message-card-time">
                          <FaClock /> {formatTime(conv.fechaUltimoMensaje) || "Hoy"}
                        </span>
                      </div>

                      <div className="message-card-bottom">
                        <p className="message-card-snippet">
                          {conv.ultimoMensaje || "Nueva consulta iniciada"}
                        </p>
                        {hasUnread && (
                          <span className="message-card-badge">
                            {conv.mensajesNoLeidos}{" "}
                            {conv.mensajesNoLeidos === 1 ? "nuevo" : "nuevos"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="message-card-action">
                      <button
                        type="button"
                        className="message-open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConversation(conv);
                        }}
                      >
                        <FaPaperPlane /> Responder
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistMessages;