function ChatInput({
  message,
  setMessage,
  onSend,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input">

      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        onKeyDown={handleKeyDown}
      />

      <button onClick={onSend}>
        Enviar
      </button>

    </div>
  );
}

export default ChatInput;