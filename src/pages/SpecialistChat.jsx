import { useEffect, useState, useRef } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaUserCircle,
  FaComments,
  FaCheck,
  FaCheckDouble,
  FaCircle,
} from "react-icons/fa";

import SpecialistLayout from "../components/SpecialistLayout";
import { db, auth } from "../services/firebase";
import "../styles/SpecialistChat.css";

function SpecialistChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationLoading, setConversationLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // 1. AUTENTICACIÓN
  // =====================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        navigate("/login", { replace: true });
        return;
      }
      setCurrentUser(firebaseUser);
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // 2. VALIDAR Y ESCUCHAR CONVERSACIÓN
  // =====================================================
  useEffect(() => {
    if (!conversationId) {
      setError("No se especificó una conversación válida.");
      setConversationLoading(false);
      return;
    }

    const conversationRef = doc(
      db,
      "conversaciones_especialistas",
      conversationId
    );

    const unsubscribe = onSnapshot(
      conversationRef,
      async (conversationSnap) => {
        if (!conversationSnap.exists()) {
          setError("La conversación no existe o fue eliminada.");
          setConversation(null);
          setConversationLoading(false);
          return;
        }

        const data = conversationSnap.data();

        // Obtener datos más frescos del paciente si existen
        let usuarioNombre = data.usuarioNombre || "Usuario";
        let usuarioFoto = data.usuarioFoto || "";

        if (data.usuarioId) {
          try {
            const userRef = doc(db, "usuarios", data.usuarioId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              usuarioNombre =
                userData.displayName ||
                userData.nombre ||
                data.usuarioNombre ||
                "Usuario";
              usuarioFoto =
                userData.photoURL ||
                userData.foto ||
                data.usuarioFoto ||
                "";
            }
          } catch {
            // fallback a data de la conversación
          }
        }

        setConversation({
          id: conversationSnap.id,
          ...data,
          usuarioNombre,
          usuarioFoto,
        });

        setError("");
        setConversationLoading(false);
      },
      (err) => {
        console.error("Error escuchando conversación:", err);
        setError("Error al cargar la conversación.");
        setConversationLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  // =====================================================
  // 3. ESCUCHAR MENSAJES EN TIEMPO REAL
  // =====================================================
  useEffect(() => {
    if (!conversation?.id) return;

    setLoadingMessages(true);

    const messagesRef = collection(
      db,
      "conversaciones_especialistas",
      conversation.id,
      "mensajes"
    );

    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Orden cronológico ascendente
        loadedMessages.sort((a, b) => {
          const timeA = a.fecha?.toMillis ? a.fecha.toMillis() : 0;
          const timeB = b.fecha?.toMillis ? b.fecha.toMillis() : 0;
          return timeA - timeB;
        });

        setMessages(loadedMessages);
        setLoadingMessages(false);
      },
      (err) => {
        console.error("Error escuchando mensajes:", err);
        setMessages([]);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [conversation?.id]);

  // =====================================================
  // 4. AUTO-SCROLL AL FINAL
  // =====================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =====================================================
  // 5. MARCAR MENSAJES COMO LEÍDOS
  // =====================================================
  useEffect(() => {
    if (
      !conversation?.id ||
      !currentUser?.uid ||
      messages.length === 0
    ) {
      return;
    }

    const unreadMessages = messages.filter(
      (msg) =>
        msg.remitenteId !== currentUser.uid &&
        msg.leido === false
    );

    if (unreadMessages.length === 0) return;

    const markAsRead = async () => {
      try {
        await Promise.all(
          unreadMessages.map((msg) => {
            const msgRef = doc(
              db,
              "conversaciones_especialistas",
              conversation.id,
              "mensajes",
              msg.id
            );
            return updateDoc(msgRef, { leido: true });
          })
        );

        const convRef = doc(
          db,
          "conversaciones_especialistas",
          conversation.id
        );
        await updateDoc(convRef, { mensajesNoLeidos: 0 });
      } catch (err) {
        console.error("Error marcando mensajes leídos:", err);
      }
    };

    markAsRead();
  }, [conversation?.id, messages, currentUser?.uid]);

  // =====================================================
  // 6. ENVIAR MENSAJE
  // =====================================================
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    const text = message.trim().slice(0, 2000);
    if (!text || sending || !currentUser?.uid || !conversation?.id) {
      return;
    }

    try {
      setSending(true);

      const messagesRef = collection(
        db,
        "conversaciones_especialistas",
        conversation.id,
        "mensajes"
      );

      await addDoc(messagesRef, {
        texto: text,
        remitenteId: currentUser.uid,
        remitenteTipo: "especialista",
        destinatarioId: conversation.usuarioId || "",
        fecha: serverTimestamp(),
        leido: false,
      });

      const convRef = doc(
        db,
        "conversaciones_especialistas",
        conversation.id
      );

      await updateDoc(convRef, {
        ultimoMensaje: text,
        ultimoEmisorId: currentUser.uid,
        fechaUltimoMensaje: serverTimestamp(),
        mensajesNoLeidos: 0,
        mensajesNoLeidosUsuario: (conversation.mensajesNoLeidosUsuario || 0) + 1,
      });

      setMessage("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== "function") return "";
    try {
      return timestamp.toDate().toLocaleTimeString("es-NI", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <SpecialistLayout>
      <div className="specialist-chat-container">
        {/* ===================================================
            HEADER DEL CHAT
            =================================================== */}
        <header className="chat-room-header">
          <button
            type="button"
            className="chat-back-btn"
            onClick={() => navigate("/specialist/messages")}
            aria-label="Volver a mensajes"
          >
            <FaArrowLeft />
          </button>

          <div className="chat-patient-info">
            <div className="chat-patient-avatar">
              {conversation?.usuarioFoto ? (
                <img
                  src={conversation.usuarioFoto}
                  alt={conversation.usuarioNombre || "Usuario"}
                />
              ) : (
                <FaUserCircle className="chat-avatar-icon" />
              )}
              <span className="chat-patient-status">
                <FaCircle />
              </span>
            </div>

            <div>
              <h2 className="chat-patient-name">
                {conversation?.usuarioNombre || "Usuario FeelSafe"}
              </h2>
              <span className="chat-patient-status-text">
                Paciente / Usuario activo
              </span>
            </div>
          </div>
        </header>

        {/* ===================================================
            CUERPO DE MENSAJES
            =================================================== */}
        <main className="chat-messages-body">
          {conversationLoading || loadingMessages ? (
            <div className="chat-loading-state">
              <div className="specialist-spinner"></div>
              <p>Cargando mensajes del paciente...</p>
            </div>
          ) : error ? (
            <div className="chat-empty-state">
              <p className="chat-error-text">⚠️ {error}</p>
              <button
                type="button"
                className="chat-action-btn"
                onClick={() => navigate("/specialist/messages")}
              >
                Volver a mensajes
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <FaComments />
              </div>
              <h3>Comienza la conversación</h3>
              <p>
                Escribe un mensaje de bienvenida y acompañamiento profesional para iniciar la atención con {conversation?.usuarioNombre || "el paciente"}.
              </p>
            </div>
          ) : (
            <div className="chat-bubbles-flow">
              {messages.map((msg) => {
                const isSpecialist =
                  msg.remitenteId === currentUser?.uid ||
                  msg.remitenteTipo === "especialista";

                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble-row ${
                      isSpecialist ? "specialist-row" : "patient-row"
                    }`}
                  >
                    <div
                      className={`chat-bubble ${
                        isSpecialist ? "specialist-bubble" : "patient-bubble"
                      }`}
                    >
                      <p className="bubble-text">{msg.texto}</p>
                      <div className="bubble-footer">
                        <span className="bubble-time">
                          {formatMessageTime(msg.fecha)}
                        </span>
                        {isSpecialist && (
                          <span
                            className={`bubble-read-receipt ${
                              msg.leido ? "read" : ""
                            }`}
                          >
                            {msg.leido ? (
                              <FaCheckDouble />
                            ) : (
                              <FaCheck />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* ===================================================
            BARRA DE ENTRADA (INPUT)
            =================================================== */}
        <footer className="chat-input-bar">
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <textarea
              className="chat-textarea"
              rows={1}
              placeholder="Escribe un mensaje de orientación y apoyo..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || conversationLoading}
              maxLength={2000}
              aria-label="Escribir mensaje al paciente"
            />

            <button
              type="submit"
              className="chat-send-btn"
              disabled={!message.trim() || sending || conversationLoading}
              aria-label="Enviar mensaje"
            >
              <FaPaperPlane />
            </button>
          </form>
        </footer>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistChat;
