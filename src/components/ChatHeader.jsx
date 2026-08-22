function ChatHeader({ specialist }) {
  const name =
    specialist?.nombre ||
    specialist?.name ||
    specialist?.nombreCompleto ||
    "Especialista";

  const photo =
    specialist?.fotoPerfil ||
    specialist?.foto ||
    specialist?.photo ||
    specialist?.photoURL ||
    "https://i.pravatar.cc/100?img=25";

  const status =
    specialist?.status ||
    specialist?.estado ||
    "En línea";

  return (
    <header className="chat-header">

      <img
        src={photo}
        alt={`Foto de ${name}`}
      />

      <div>

        <h2>
          {name}
        </h2>

        <span>
          🟢 {status}
        </span>

      </div>

    </header>
  );
}

export default ChatHeader;