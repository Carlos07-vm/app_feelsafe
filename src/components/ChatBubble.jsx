function ChatBubble({ message }) {
  return (
    <div
      className={`message ${
        message.sender === "user"
          ? "sent"
          : "received"
      }`}
    >
      {message.text}
    </div>
  );
}

export default ChatBubble;