import ChatBubble from "./ChatBubble";

function MessageList({ messages }) {
  return (
    <div className="messages">

      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
        />
      ))}

    </div>
  );
}

export default MessageList;