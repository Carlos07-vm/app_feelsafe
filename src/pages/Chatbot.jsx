import MainLayout from "../layouts/MainLayout";
import { FaPaperPlane } from "react-icons/fa";
import { useState } from "react";
import { queryGemini } from "../services/geminiService";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hola 👋 Soy FeelSafe AI. Estoy aquí para escucharte y apoyarte con empatía.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    const nextMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await queryGemini(trimmed, nextMessages);
      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
    } catch (err) {
      setError(err.message || "Error al conectar con Gemini.");
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

  return (
    <MainLayout>
      <div className="chat-container">
        <div className="chat-header">
          <h2>🤖 FeelSafe AI</h2>
          <p>Tu asistente emocional inteligente</p>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {error && <div className="chat-error">{error}</div>}

        <div className="chat-input">
          <input
            type="text"
            placeholder="Escribe cómo te sientes..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />

          <button type="button" onClick={handleSend} disabled={loading}>
            {loading ? "Enviando..." : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default Chatbot;
