function ChatInput({
  message,
  setMessage,
  onSend,
  disabled = false,
}) {

  const handleKeyDown = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      onSend();

    }

  };


  const hasMessage =
    message.trim().length > 0;


  return (

    <div className="chat-input">

      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(event) =>
          setMessage(
            event.target.value
          )
        }
        onKeyDown={handleKeyDown}
        aria-label="Escribir mensaje"
        maxLength={2000}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={onSend}
        disabled={!hasMessage || disabled}
        aria-label="Enviar mensaje"
      >
        Enviar
      </button>

    </div>

  );

}

export default ChatInput;
