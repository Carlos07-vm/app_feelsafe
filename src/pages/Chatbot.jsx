import "../styles/Chatbot.css";
import MainLayout from "../layouts/MainLayout";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { queryGemini } from "../services/geminiService";

import {
  crearConversacion,
  obtenerConversaciones,
  actualizarUltimoMensaje,
} from "../services/conversacionService";

import {
  crearMensajeChat,
  obtenerMensajesChat,
  eliminarMensajesChat,
  limpiarMensajesChatAntiguos,
} from "../services/mensajeChatService";

const MENSAJE_BIENVENIDA =
  "Hola 👋 Soy FeelSafe AI. Estoy aquí para escucharte y apoyarte con empatía.";

function Chatbot() {
  const navigate = useNavigate();

  const [conversationId, setConversationId] =
    useState(null);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingChat, setLoadingChat] =
    useState(true);

  const [error, setError] = useState(null);

  const [supportLevel, setSupportLevel] =
    useState("normal");

  const [supportRecommendation, setSupportRecommendation] =
    useState("");

  const messagesEndRef = useRef(null);
  const conversacionIniciadaRef =
    useRef(false);
  const inputRef = useRef(null);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================================
  // INICIAR / RECUPERAR CONVERSACIÓN
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const iniciarConversacion = async () => {
      if (conversacionIniciadaRef.current)
        return;

      conversacionIniciadaRef.current = true;

      const usuarioActual =
        auth.currentUser;

      if (!usuarioActual) {
        if (isMounted) {
          setError(
            "Debes iniciar sesión para usar el chatbot."
          );
          setLoadingChat(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoadingChat(true);
          setError(null);
        }

        // ======================================================
        // 1. BUSCAR CONVERSACIONES EXISTENTES
        // ======================================================

        const resultadoConversaciones =
          await obtenerConversaciones(
            usuarioActual.uid
          );

        let idConversacion = null;

        if (
          resultadoConversaciones.success &&
          resultadoConversaciones.data.length > 0
        ) {
          idConversacion =
            resultadoConversaciones.data[0].id;
        } else {
          // ====================================================
          // 2. SI NO EXISTE, CREAR UNA NUEVA
          // ====================================================

          const nuevaConversacion =
            await crearConversacion({
              uidUsuario:
                usuarioActual.uid,
              titulo:
                "Conversación con FeelSafe AI",
            });

          if (!nuevaConversacion.success) {
            throw new Error(
              nuevaConversacion.error
            );
          }

          idConversacion =
            nuevaConversacion.id;
        }

        if (!isMounted) return;

        setConversationId(
          idConversacion
        );

        // ======================================================
        // 3. CARGAR MENSAJES EXISTENTES
        // ======================================================

        const resultadoMensajes =
          await obtenerMensajesChat(
            idConversacion
          );

        if (!isMounted) return;

        if (
          resultadoMensajes.success &&
          resultadoMensajes.data.length > 0
        ) {
          const mensajesFormateados =
            resultadoMensajes.data.map(
              (msg) => ({
                id: msg.id || `${msg.remitente}-${Date.now()}-${Math.random()}`,
                sender:
                  msg.remitente ===
                  "Usuario"
                    ? "user"
                    : "bot",
                text: msg.mensaje,
              })
            );

          setMessages(
            mensajesFormateados
          );
        } else {
          const mensajeInicial = {
            id: `welcome-${Date.now()}`,
            sender: "bot",
            text: MENSAJE_BIENVENIDA,
          };

          setMessages([
            mensajeInicial,
          ]);

          await crearMensajeChat({
            idConversacion,
            uidUsuario:
              usuarioActual.uid,
            remitente: "Bot",
            mensaje:
              MENSAJE_BIENVENIDA,
          });
        }
      } catch (err) {
        console.error(
          "Error al iniciar conversación:",
          err
        );

        if (isMounted) {
          setMessages([
            {
              id: `fallback-${Date.now()}`,
              sender: "bot",
              text: MENSAJE_BIENVENIDA,
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setLoadingChat(false);
          inputRef.current?.focus();
        }
      }
    };

    iniciarConversacion();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // ENVIAR MENSAJE
  // ============================================================

  const handleSend = async () => {
    const trimmed = message.trim();

    if (!trimmed || loading)
      return;

    const usuarioActual =
      auth.currentUser;

    if (!usuarioActual) {
      setError(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );

      return;
    }

    if (!conversationId) {
      setError(
        "No se pudo cargar la conversación."
      );

      return;
    }

    setError(null);

    const mensajeUsuario = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const nextMessages = [
      ...messages,
      mensajeUsuario,
    ];

    setMessages(nextMessages);

    setMessage("");

    setLoading(true);

    inputRef.current?.focus();

    try {
      // ========================================================
      // GUARDAR MENSAJE DEL USUARIO
      // ========================================================

      const resultadoUsuario =
        await crearMensajeChat({
          idConversacion:
            conversationId,

          uidUsuario:
            usuarioActual.uid,

          remitente: "Usuario",

          mensaje: trimmed,
        });

      if (!resultadoUsuario.success) {
        console.error(
          "No se guardó el mensaje del usuario:",
          resultadoUsuario.error
        );
      }

      // ========================================================
      // GEMINI
      // ========================================================

      const aiResult =
        await queryGemini(
          trimmed,
          nextMessages
        );

      const mensajeBot = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: aiResult.response,
      };

      setMessages((prev) => [
        ...prev,
        mensajeBot,
      ]);

      setSupportLevel(
        aiResult.level
      );

      setSupportRecommendation(
        aiResult.recommendation
      );

      // ========================================================
      // GUARDAR RESPUESTA DEL BOT
      // ========================================================

      const resultadoBot =
        await crearMensajeChat({
          idConversacion:
            conversationId,

          uidUsuario:
            usuarioActual.uid,

          remitente: "Bot",

          mensaje:
            aiResult.response,
        });

      if (!resultadoBot.success) {
        console.error(
          "No se guardó respuesta del bot:",
          resultadoBot.error
        );
      }

      // ========================================================
      // ACTUALIZAR FECHA DE CONVERSACIÓN
      // ========================================================

      await actualizarUltimoMensaje(
        conversationId
      );
      await limpiarMensajesChatAntiguos(conversationId);
    } catch (err) {
      console.error(
        "Error al procesar mensaje:",
        err
      );

      setError(
        "No pude conectar con FeelSafe AI. Intenta de nuevo."
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text:
            "Lo siento, no pude procesar tu mensaje en este momento. Por favor inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);

      inputRef.current?.focus();
    }
  };

  // ============================================================
  // ENTER
  // ============================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSend();
    }
  };

  // ============================================================
  // LIMPIAR CHAT
  // ============================================================

  const handleClear = async () => {
    if (!conversationId) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "bot",
          text: MENSAJE_BIENVENIDA,
        },
      ]);

      return;
    }

    try {
      setLoadingChat(true);
      setError(null);

      // ========================================================
      // ELIMINAR MENSAJES DE FIRESTORE
      // ========================================================

      const resultado =
        await eliminarMensajesChat(
          conversationId
        );

      if (!resultado.success) {
        throw new Error(
          resultado.error
        );
      }

      // ========================================================
      // REINICIAR CHAT VISUALMENTE
      // ========================================================

      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "bot",
          text: MENSAJE_BIENVENIDA,
        },
      ]);

      setSupportLevel("normal");

      setSupportRecommendation("");

      // ========================================================
      // VOLVER A GUARDAR BIENVENIDA
      // ========================================================

      const usuarioActual =
        auth.currentUser;

      if (usuarioActual) {
        await crearMensajeChat({
          idConversacion:
            conversationId,

          uidUsuario:
            usuarioActual.uid,

          remitente: "Bot",

          mensaje:
            MENSAJE_BIENVENIDA,
        });
      }

      console.log(
        "Chat limpiado correctamente."
      );
    } catch (err) {
      console.error(
        "Error al limpiar chat:",
        err
      );

      setError(
        "No se pudo limpiar el historial. Intenta nuevamente."
      );
    } finally {
      setLoadingChat(false);

      inputRef.current?.focus();
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <MainLayout>
      <div className="chat-wrapper">
        <div className="chat-container">

          {/* ENCABEZADO */}

          <div className="chat-header">
            <div className="chat-header-info">
              <h2>🤖 FeelSafe AI</h2>

              <p>
                Tu asistente emocional inteligente
              </p>
            </div>

            <button
              className="clear-chat-btn"
              type="button"
              onClick={handleClear}
              disabled={loadingChat}
              title="Limpiar chat"
            >
              <FaTrash />

              <span>
                Limpiar
              </span>
            </button>
          </div>

          {/* ESTADO CARGANDO */}

          {loadingChat && (
            <div className="chat-status">
              <div className="chat-spinner"></div>

              <span>
                Cargando tu espacio seguro...
              </span>
            </div>
          )}

          {/* MENSAJES */}

          <div className="chat-messages">

            {messages.map(
              (msg) => (
                <div
                  key={msg.id}
                  className={`message-wrapper ${
                    msg.sender === "user"
                      ? "wrapper-user"
                      : "wrapper-bot"
                  }`}
                >
                  <div
                    className={`message-bubble ${msg.sender}`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}

            {/* TYPING */}

            {loading && (
              <div className="message-wrapper wrapper-bot">
                <div className="message-bubble bot typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* RECOMENDACIÓN APOYO */}

          {supportLevel ===
            "apoyo" && (
            <div className="support-recommendation support-normal">

              <div className="support-recommendation-icon">
                💜
              </div>

              <div className="support-recommendation-content">

                <h3>
                  Puede ayudarte hablar con alguien
                </h3>

                <p>
                  {supportRecommendation ||
                    "Hablar con una persona de confianza puede ayudarte a sentirte acompañado."}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/sos")}
                >
                  Ver opciones de apoyo
                </button>

              </div>
            </div>
          )}

          {/* RECOMENDACIÓN URGENTE */}

          {supportLevel ===
            "urgente" && (
            <div className="support-recommendation support-urgent">

              <div className="support-recommendation-icon">
                🆘
              </div>

              <div className="support-recommendation-content">

                <h3>
                  Busca apoyo humano ahora
                </h3>

                <p>
                  {supportRecommendation ||
                    "No tienes que afrontar esto solo. Busca a una persona de confianza que pueda acompañarte."}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/sos")}
                >
                  Ir al Centro SOS
                </button>

              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          {/* INPUT */}

          <div className="chat-input-container">

            <input
              ref={inputRef}
               type="text"
               className="chat-input-field"
               aria-label="Escribe tu mensaje"
              placeholder={
                loading
                  ? "FeelSafe AI está respondiendo..."
                  : "Escribe cómo te sientes..."
              }
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loadingChat}
              autoComplete="off"
              maxLength={2000}
            />

            <button
              className="chat-send-btn"
              type="button"
              onClick={handleSend}
              disabled={
                loading ||
                loadingChat ||
                !message.trim()
              }
               title={
                loading
                  ? "FeelSafe AI está respondiendo..."
                 : "Enviar mensaje"
               }
               aria-label={loading ? "FeelSafe AI está respondiendo" : "Enviar mensaje"}
            >
              <FaPaperPlane />
            </button>

          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Chatbot;
