import Sidebar from "../components/Sidebar";
import { FaPaperPlane } from "react-icons/fa";
import { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");

  const messages = [
    {
      sender: "bot",
      text: "Hola 👋 Soy FeelSafe AI. Estoy aquí para ayudarte."
    },
    {
      sender: "user",
      text: "Hoy me siento un poco estresado."
    },
    {
      sender: "bot",
      text: "Entiendo. ¿Quieres contarme qué está causando ese estrés?"
    }
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <div className="chat-container">

          <div className="chat-header">
            <h2>🤖 FeelSafe AI</h2>
            <p>Tu asistente emocional inteligente</p>
          </div>

          <div className="chat-messages">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}

          </div>

          <div className="chat-input">

            <input
              type="text"
              placeholder="Escribe cómo te sientes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button>
              <FaPaperPlane />
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Chatbot;