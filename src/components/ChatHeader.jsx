function ChatHeader({ specialist }) {
  return (
    <div className="chat-header">

      <img
        src={
          specialist?.photo ||
          "https://i.pravatar.cc/60?img=25"
        }
        alt={specialist?.name || "Especialista"}
      />

      <div>
        <h2>
          {specialist?.name || "Especialista"}
        </h2>

        <span>
          🟢 {specialist?.status || "En línea"}
        </span>
      </div>

    </div>
  );
}

export default ChatHeader;