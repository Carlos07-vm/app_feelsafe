import { useState } from "react";
import { useLocation } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";

import "../styles/ChatRoom.css";

function ChatRoom() {
  const location = useLocation();

  // Especialista seleccionado desde Specialists.jsx
  const specialist = location.state?.specialist;

  // Mensaje que está escribiendo el usuario
  const [message, setMessage] = useState("");

  // Mensajes de la conversación
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hola 👋 ¿Cómo te sientes hoy?",
      sender: "specialist",
    },
    {
      id: 2,
      text: "Hola doctora.",
      sender: "user",
    },
    {
      id: 3,
      text: "Me he sentido bastante ansioso.",
      sender: "user",
    },
    {
      id: 4,
      text: "Gracias por compartirlo. ¿Quieres contarme qué ocurrió?",
      sender: "specialist",
    },
  ]);

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!message.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "user",
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
    ]);

    setMessage("");
  };

  return (
    <MainLayout>

      <div className="chat-room">

        {/* ================= Encabezado ================= */}

        <ChatHeader specialist={specialist} />

        {/* ================= Mensajes ================= */}

        <MessageList messages={messages} />

        {/* ================= Entrada de mensaje ================= */}

        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
        />

      </div>

    </MainLayout>
  );
}

export default ChatRoom;