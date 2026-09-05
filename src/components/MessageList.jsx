function MessageList({ messages }) {

  return (

    <div className="message-list">

      {messages.length === 0 ? (

        <div className="empty-chat">

          <div className="empty-chat-icon">
            💬
          </div>

          <h3>
            Inicia la conversación
          </h3>

          <p>
            Envía un mensaje para comenzar
            a hablar con el especialista.
          </p>

        </div>

      ) : (

        messages.map((msg) => {

          const isUser =
            msg.sender === "user" ||
            msg.remitenteTipo === "usuario";


          return (

            <div
              key={msg.id}
              className={`message-row ${
                isUser
                  ? "message-row-user"
                  : "message-row-specialist"
              }`}
            >

              <div
                className={`message-bubble ${
                  isUser
                    ? "message-bubble-user"
                    : "message-bubble-specialist"
                }`}
              >

                <p className="message-text">
                  {msg.text}
                </p>

                <span className="message-time">
                  {msg.time || "Ahora"}

                  {isUser && (
                    <span
                      style={{
                        marginLeft: "4px",
                        fontSize: "10px",
                      }}
                    >
                      {msg.leido ? "✓✓" : "✓"}
                    </span>
                  )}

                </span>

              </div>

            </div>

          );

        })

      )}

    </div>

  );

}

export default MessageList;
