import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { FaComments, FaKey, FaLock, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { db } from "../services/firebase";
import { joinSpecialistRoom, normalizeRoomCode } from "../services/specialistRoomService";
import "../styles/UserConversations.css";

function UserConversations() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [conversations, setConversations] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid) return undefined;

    const conversationsQuery = query(
      collection(db, "conversaciones_especialistas"),
      where("usuarioId", "==", user.uid)
    );

    return onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const nextConversations = snapshot.docs
          .map((conversationDoc) => ({
            id: conversationDoc.id,
            ...conversationDoc.data(),
          }))
          .sort((a, b) => {
            const timeA = a.fechaUltimoMensaje?.toMillis?.() || 0;
            const timeB = b.fechaUltimoMensaje?.toMillis?.() || 0;
            return timeB - timeA;
          });

        setConversations(nextConversations);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Error cargando conversaciones del usuario:", snapshotError);
        setError("No pudimos cargar tus conversaciones.");
        setLoading(false);
      }
    );
  }, [user?.uid]);

  const openConversation = (conversation) => {
    navigate(`/chat-room/${conversation.id}`, {
      state: {
        specialist: {
          uid: conversation.especialistaId,
          especialistaId: conversation.especialistaId,
          nombre: conversation.especialistaNombre || "Especialista",
          name: conversation.especialistaNombre || "Especialista",
          fotoPerfil: conversation.especialistaFoto || "",
          photo: conversation.especialistaFoto || "",
          status: "Conversación privada",
        },
      },
    });
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();
    if (joining) return;

    try {
      setJoining(true);
      setError("");
      const room = await joinSpecialistRoom(roomCode, user);
      setRoomCode("");
      navigate(`/room/${room.id}`);
    } catch (joinError) {
      setError(joinError.message || "No pudimos abrir la sala.");
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Sin mensajes todavía";
    return timestamp.toDate().toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="user-conversations-page">
        <header className="user-conversations-header">
          <div>
            <span className="user-conversations-eyebrow">ACOMPAÑAMIENTO PROFESIONAL</span>
            <h1>Mis conversaciones</h1>
            <p>Retoma tus chats con especialistas o entra a una sala privada con el código que te compartieron.</p>
          </div>
          <div className="user-conversations-header-icon" aria-hidden="true"><FaComments /></div>
        </header>

        <section className="room-join-card" aria-labelledby="room-join-title">
          <div className="room-join-icon" aria-hidden="true"><FaKey /></div>
          <div className="room-join-copy">
            <h2 id="room-join-title">¿Tienes un código de sala?</h2>
            <p>Úsalo para unirte a una conversación privada con tu especialista.</p>
          </div>
          <form className="room-join-form" onSubmit={handleJoinRoom}>
            <label htmlFor="specialist-room-code">Código de acceso</label>
            <div className="room-join-controls">
              <input
                id="specialist-room-code"
                value={roomCode}
                onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
                placeholder="ABC123"
                maxLength={6}
                autoComplete="off"
                aria-describedby="room-join-help"
              />
              <button type="submit" disabled={joining || roomCode.length !== 6}>
                {joining ? "Validando..." : "Unirme"}
              </button>
            </div>
            <small id="room-join-help">El código tiene 6 caracteres.</small>
          </form>
        </section>

        {error && <p className="user-conversations-error" role="alert">{error}</p>}

        <section className="user-conversations-list" aria-labelledby="conversation-history-title">
          <div className="user-conversations-section-heading">
            <div>
              <span className="user-conversations-eyebrow">HISTORIAL</span>
              <h2 id="conversation-history-title">Chats con especialistas</h2>
            </div>
            <span className="conversation-count">{conversations.length}</span>
          </div>

          {loading ? (
            <div className="user-conversations-empty">Cargando tus conversaciones...</div>
          ) : conversations.length === 0 ? (
            <div className="user-conversations-empty">
              <FaUserMd aria-hidden="true" />
              <h3>Aún no tienes conversaciones</h3>
              <p>Elige un especialista para iniciar un chat seguro.</p>
              <button type="button" onClick={() => navigate("/specialists")}>Ver especialistas</button>
            </div>
          ) : (
            <div className="user-conversation-cards">
              {conversations.map((conversation) => (
                <article className="user-conversation-card" key={conversation.id}>
                  <div className="user-conversation-avatar">
                    {conversation.especialistaFoto ? (
                      <img src={conversation.especialistaFoto} alt="" />
                    ) : (
                      <FaUserMd aria-hidden="true" />
                    )}
                  </div>
                  <div className="user-conversation-main">
                    <div className="user-conversation-title-row">
                      <h3>{conversation.especialistaNombre || "Especialista FeelSafe"}</h3>
                      <time>{formatDate(conversation.fechaUltimoMensaje)}</time>
                    </div>
                    <p>{conversation.ultimoMensaje || "Conversación iniciada. Envía un mensaje cuando quieras."}</p>
                    <span className="user-conversation-private"><FaLock aria-hidden="true" /> Conversación privada</span>
                  </div>
                  <button type="button" onClick={() => openConversation(conversation)}>Abrir chat</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default UserConversations;
