import "../styles/Chatbot.css";
import MainLayout from "../layouts/MainLayout";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { auth } from "../services/firebase";
import { queryGemini } from "../services/geminiService";

import {
  crearConversacion,
  actualizarUltimoMensaje,
} from "../services/conversacionService";

import {
  crearMensajeChat,
  obtenerMensajesChat,
} from "../services/mensajeChatService";

function Chatbot() {
  const { user } = useApp();
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hola 👋 Soy FeelSafe AI. Estoy aquí para escucharte y apoyarte con empatía.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [error, setError] = useState(null);
  
  // Referencia para hacer scroll automático al último mensaje
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /*
   * Crear una conversación cuando se abre el chatbot
   */
  useEffect(() => {
    const iniciarConversacion = async () => {
      const usuarioActual = auth.currentUser;

      if (!usuarioActual) {
        setError("Debes iniciar sesión para usar el chatbot.");
        setLoadingChat(false);
        return;
      }

      try {
        setLoadingChat(true);

        const resultado = await crearConversacion({
          uidUsuario: usuarioActual.uid,
          titulo: "Conversación con FeelSafe AI",
        });

        if (!resultado.success) {
          throw new Error(resultado.error);
        }

        const idConversacion = resultado.id;
        setConversationId(idConversacion);
        console.log("Conversación creada correctamente:", idConversacion);

        const mensajeInicial = await crearMensajeChat({
          idConversacion,
          uidUsuario: usuarioActual.uid,
          remitente: "Bot",
          mensaje: "Hola 👋 Soy FeelSafe AI. Estoy aquí para escucharte y apoyarte con empatía.",
        });

        if (!mensajeInicial.success) {
          throw new Error(mensajeInicial.error);
        }

        const mensajesGuardados = await obtenerMensajesChat(idConversacion);

        if (!mensajesGuardados.success) {
          throw new Error(mensajesGuardados.error);
        }

        if (mensajesGuardados.data.length > 0) {
          const mensajesFormateados = mensajesGuardados.data.map((mensaje) => ({
            sender: mensaje.remitente === "Usuario" ? "user" : "bot",
            text: mensaje.mensaje,
          }));
          setMessages(mensajesFormateados);
        }
      } catch (err) {
        console.error("Error al iniciar conversación:", err);
        setError("No se pudo iniciar la conversación: " + err.message);
      } finally {
        setLoadingChat(false);
      }
    };

    iniciarConversacion();
  }, []);

  /*
   * Enviar mensaje
   */
  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!conversationId) {
      setError("La conversación todavía no está lista.");
      return;
    }

    const usuarioActual = auth.currentUser;

    if (!usuarioActual) {
      setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
      return;
    }

    setError(null);

    const mensajeUsuario = {
      sender: "user",
      text: trimmed,
    };

    const nextMessages = [...messages, mensajeUsuario];

    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const resultadoUsuario = await crearMensajeChat({
        idConversacion: conversationId,
        uidUsuario: usuarioActual.uid,
        remitente: "Usuario",
        mensaje: trimmed,
      });

      if (!resultadoUsuario.success) {
        throw new Error("No se pudo guardar el mensaje del usuario: " + resultadoUsuario.error);
      }

      const response = await queryGemini(trimmed, nextMessages);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response,
        },
      ]);

      const resultadoBot = await crearMensajeChat({
        idConversacion: conversationId,
        uidUsuario: usuarioActual.uid,
        remitente: "Bot",
        mensaje: response,
      });

      if (!resultadoBot.success) {
        throw new Error("No se pudo guardar la respuesta del bot: " + resultadoBot.error);
      }

      const actualizacion = await actualizarUltimoMensaje(conversationId);

      if (!actualizacion.success) {
        console.error("No se pudo actualizar la conversación:", actualizacion.error);
      }
    } catch (err) {
      console.error("Error al procesar mensaje:", err);
      setError(err.message || "Error al conectar con FeelSafe AI.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Lo siento, no pude procesar tu mensaje en este momento. Por favor inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Limpiar conversación visual
   */
  const handleClear = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hola 👋 Soy FeelSafe AI. Estoy aquí para escucharte y apoyarte con empatía.",
      },
    ]);
    setError(null);
  };

  return (
    <MainLayout>
      <div className="chat-wrapper">
        <div className="chat-container">
          
          {/* ENCABEZADO */}
          <div className="chat-header">
            <div className="chat-header-info">
              <h2>🤖 FeelSafe AI</h2>
              <p>Tu asistente emocional inteligente</p>
            </div>

            <button
              className="clear-chat-btn"
              type="button"
              onClick={handleClear}
              title="Limpiar chat"
            >
              <FaTrash /> <span>Limpiar</span>
            </button>
          </div>

          {/* ESTADO CARGANDO */}
          {loadingChat && (
            <div className="chat-status">
              <div className="chat-spinner"></div>
              <span>Iniciando espacio seguro...</span>
            </div>
          )}

          {/* ÁREA DE MENSAJES */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.sender === "user" ? "wrapper-user" : "wrapper-bot"}`}
              >
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper wrapper-bot">
                <div className="message-bubble bot typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* MENSAJES DE ERROR */}
          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          {/* INPUT DE TEXTO */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input-field"
              placeholder="Escribe cómo te sientes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading || loadingChat || !conversationId}
            />

            <button
              className="chat-send-btn"
              type="button"
              onClick={handleSend}
              disabled={loading || loadingChat || !conversationId || !message.trim()}
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