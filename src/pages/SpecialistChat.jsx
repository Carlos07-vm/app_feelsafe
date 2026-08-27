import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import SpecialistLayout from "../components/SpecialistLayout";

import {
  db,
  auth,
} from "../services/firebase";

import "../styles/SpecialistChat.css";

function SpecialistChat() {
  const navigate = useNavigate();

  const { conversationId } = useParams();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [conversationLoading, setConversationLoading] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // AUTENTICACIÓN DEL ESPECIALISTA
  // =====================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!firebaseUser) {
            setCurrentUser(null);

            navigate(
              "/specialist/login",
              { replace: true }
            );

            return;
          }

          console.log(
            "ESPECIALISTA AUTENTICADO:",
            firebaseUser.uid
          );

          setCurrentUser(firebaseUser);
        }
      );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // VALIDAR CONVERSACIÓN
  // =====================================================

  useEffect(() => {
    if (!conversationId) {
      setError(
        "No se encontró el ID de la conversación."
      );

      setConversationLoading(false);

      return;
    }

    if (!currentUser?.uid) {
      return;
    }

    let cancelled = false;

    const loadConversation =
      async () => {
        try {
          setConversationLoading(true);
          setError("");

          const conversationRef =
            doc(
              db,
              "conversaciones_especialistas",
              conversationId
            );

          const conversationSnap =
            await getDoc(
              conversationRef
            );

          if (!conversationSnap.exists()) {
            if (!cancelled) {
              setConversation(null);

              setError(
                "Esta conversación no existe."
              );

              setConversationLoading(false);
            }

            return;
          }

          const data =
            conversationSnap.data();

          // =================================================
          // SEGURIDAD
          // =================================================

          if (
            data.especialistaId !==
            currentUser.uid
          ) {
            console.error(
              "Conversación no pertenece al especialista."
            );

            if (!cancelled) {
              setConversation(null);

              setError(
                "No tienes permiso para acceder a esta conversación."
              );

              setConversationLoading(false);
            }

            return;
          }

          const loadedConversation = {
            id: conversationSnap.id,
            ...data,
          };

          console.log(
            "CONVERSACIÓN CARGADA:",
            loadedConversation
          );

          if (!cancelled) {
            setConversation(
              loadedConversation
            );

            setConversationLoading(false);
          }
        } catch (err) {
          console.error(
            "Error cargando conversación:",
            err
          );

          if (!cancelled) {
            setConversation(null);

            setError(
              "No se pudo cargar la conversación."
            );

            setConversationLoading(false);
          }
        }
      };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [
    conversationId,
    currentUser?.uid,
  ]);

  // =====================================================
  // ESCUCHAR MENSAJES
  // =====================================================

  useEffect(() => {
    if (
      !conversation?.id ||
      !currentUser?.uid
    ) {
      return;
    }

    setLoadingMessages(true);

    const messagesRef =
      collection(
        db,
        "conversaciones_especialistas",
        conversation.id,
        "mensajes"
      );

    const unsubscribe =
      onSnapshot(
        messagesRef,
        (snapshot) => {
          const loadedMessages =
            snapshot.docs.map(
              (messageDoc) => {
                const data =
                  messageDoc.data();

                let sender = "user";

                if (
                  data.remitenteId ===
                  currentUser.uid
                ) {
                  sender =
                    "specialist";
                }

                let date = null;
                let time = "";

                if (
                  data.fecha &&
                  typeof data.fecha.toDate ===
                    "function"
                ) {
                  date =
                    data.fecha.toDate();

                  time =
                    date.toLocaleTimeString(
                      "es-NI",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                }

                return {
                  id: messageDoc.id,

                  text:
                    data.texto ||
                    data.text ||
                    "",

                  texto:
                    data.texto ||
                    data.text ||
                    "",

                  remitenteId:
                    data.remitenteId ||
                    "",

                  remitenteTipo:
                    data.remitenteTipo ||
                    "",

                  destinatarioId:
                    data.destinatarioId ||
                    "",

                  fecha:
                    data.fecha ||
                    null,

                  date,
                  time,

                  leido:
                    data.leido ?? false,

                  sender,

                  isSpecialist:
                    sender ===
                    "specialist",

                  isUser:
                    sender === "user",
                };
              }
            );

          loadedMessages.sort(
            (a, b) => {
              const timeA =
                a.date
                  ? a.date.getTime()
                  : 0;

              const timeB =
                b.date
                  ? b.date.getTime()
                  : 0;

              return timeA - timeB;
            }
          );

          setMessages(
            loadedMessages
          );

          setLoadingMessages(false);
        },
        (err) => {
          console.error(
            "Error escuchando mensajes:",
            err
          );

          setMessages([]);

          setLoadingMessages(false);
        }
      );

    return () => unsubscribe();
  }, [
    conversation?.id,
    currentUser?.uid,
  ]);

  // =====================================================
  // MARCAR MENSAJES COMO LEÍDOS
  // =====================================================

  useEffect(() => {
    if (
      !conversation?.id ||
      !conversation?.usuarioId ||
      !currentUser?.uid ||
      messages.length === 0
    ) {
      return;
    }

    const unreadMessages =
      messages.filter(
        (msg) =>
          msg.remitenteId ===
            conversation.usuarioId &&
          msg.leido === false
      );

    if (
      unreadMessages.length === 0
    ) {
      return;
    }

    const markAsRead =
      async () => {
        try {
          await Promise.all(
            unreadMessages.map(
              async (msg) => {
                const messageRef =
                  doc(
                    db,
                    "conversaciones_especialistas",
                    conversation.id,
                    "mensajes",
                    msg.id
                  );

                await updateDoc(
                  messageRef,
                  {
                    leido: true,
                  }
                );
              }
            )
          );

          const conversationRef =
            doc(
              db,
              "conversaciones_especialistas",
              conversation.id
            );

          await updateDoc(
            conversationRef,
            {
              mensajesNoLeidos: 0,
            }
          );
        } catch (err) {
          console.error(
            "Error marcando mensajes:",
            err
          );
        }
      };

    markAsRead();
  }, [
    conversation,
    messages,
    currentUser?.uid,
  ]);

  // =====================================================
  // ENVIAR MENSAJE
  // =====================================================

  const handleSendMessage =
    async () => {
      const text =
        message.trim();

      if (
        !text ||
        sending ||
        !currentUser?.uid ||
        !conversation?.id ||
        !conversation?.usuarioId
      ) {
        return;
      }

      if (
        conversation.especialistaId !==
        currentUser.uid
      ) {
        console.error(
          "No tienes permiso para enviar mensajes aquí."
        );

        return;
      }

      try {
        setSending(true);

        const messagesRef =
          collection(
            db,
            "conversaciones_especialistas",
            conversation.id,
            "mensajes"
          );

        // =================================================
        // CREAR MENSAJE
        // =================================================

        await addDoc(
          messagesRef,
          {
            texto: text,

            remitenteId:
              currentUser.uid,

            remitenteTipo:
              "especialista",

            destinatarioId:
              conversation.usuarioId,

            fecha:
              serverTimestamp(),

            leido: false,
          }
        );

        // =================================================
        // ACTUALIZAR CONVERSACIÓN
        // =================================================

        const conversationRef =
          doc(
            db,
            "conversaciones_especialistas",
            conversation.id
          );

        await updateDoc(
          conversationRef,
          {
            ultimoMensaje: text,

            fechaUltimoMensaje:
              serverTimestamp(),

            mensajesNoLeidos: 0,

            mensajesNoLeidosUsuario: 1,
          }
        );

        setMessage("");
      } catch (err) {
        console.error(
          "Error enviando mensaje:",
          err
        );

        setError(
          "No se pudo enviar el mensaje."
        );
      } finally {
        setSending(false);
      }
    };

  // =====================================================
  // ENTER
  // =====================================================

  const handleKeyDown =
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        handleSendMessage();
      }
    };

  // =====================================================
  // VOLVER
  // =====================================================

  const goBack =
    () => {
      navigate(
        "/specialist/messages"
      );
    };

  // =====================================================
  // LOADING CONVERSACIÓN
  // =====================================================

  if (
    conversationLoading
  ) {
    return (
      <SpecialistLayout>
        <div className="specialist-chat-loading">
          <div className="specialist-loading-icon">
            💬
          </div>

          <p>
            Cargando conversación...
          </p>
        </div>
      </SpecialistLayout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    !conversation?.id
  ) {
    return (
      <SpecialistLayout>
        <div className="specialist-chat-error">

          <div className="specialist-error-icon">
            ⚠️
          </div>

          <h2>
            No se puede abrir la conversación
          </h2>

          <p>
            {error ||
              "La conversación no está disponible."}
          </p>

          <button
            onClick={goBack}
          >
            ← Volver a mensajes
          </button>

        </div>
      </SpecialistLayout>
    );
  }

  // =====================================================
  // LOADING MENSAJES
  // =====================================================

  if (
    loadingMessages
  ) {
    return (
      <SpecialistLayout>
        <div className="specialist-chat-loading">
          <div className="specialist-loading-icon">
            💬
          </div>

          <p>
            Cargando mensajes...
          </p>
        </div>
      </SpecialistLayout>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <SpecialistLayout>

      <div className="specialist-chat-page">

        {/* ============================================
            HEADER
        ============================================= */}

        <div className="specialist-chat-header">

          <button
            className="specialist-back-button"
            onClick={goBack}
          >
            ←
          </button>

          <div className="specialist-user-avatar">

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

          <div className="specialist-user-info">

            <h2>
              {conversation.usuarioNombre ||
                "Usuario"}
            </h2>

            <span>
              🟢 Conversación activa
            </span>

          </div>

        </div>

        {/* ============================================
            MENSAJES
        ============================================= */}

        <div className="specialist-messages">

          {messages.length === 0 ? (

            <div className="specialist-empty-chat">

              <div>
                💬
              </div>

              <h3>
                No hay mensajes
              </h3>

              <p>
                Todavía no hay mensajes en
                esta conversación.
              </p>

            </div>

          ) : (

            messages.map(
              (msg) => {
                const isSpecialist =
                  msg.isSpecialist;

                return (
                  <div
                    key={msg.id}
                    className={`specialist-message-row ${
                      isSpecialist
                        ? "specialist-message-right"
                        : "specialist-message-left"
                    }`}
                  >

                    <div
                      className={`specialist-message-bubble ${
                        isSpecialist
                          ? "specialist-bubble"
                          : "user-bubble"
                      }`}
                    >

                      <div className="specialist-message-text">
                        {msg.text}
                      </div>

                      <div className="specialist-message-time">

                        {msg.time}

                        {isSpecialist && (
                          <span className="message-check">
                            {msg.leido
                              ? "✓✓"
                              : "✓"}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )
          )}

        </div>

        {/* ============================================
            INPUT
        ============================================= */}

        <div className="specialist-chat-input">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Escribe una respuesta..."
            rows={1}
            disabled={sending}
          />

          <button
            onClick={
              handleSendMessage
            }
            disabled={
              sending ||
              !message.trim()
            }
          >
            {sending
              ? "..."
              : "➤"}
          </button>

        </div>

      </div>

    </SpecialistLayout>
  );
}

export default SpecialistChat;