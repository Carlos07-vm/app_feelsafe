import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { FaArrowLeft, FaDoorOpen, FaKey } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import SpecialistLayout from "../components/SpecialistLayout";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import MessageList from "../components/MessageList";
import { useApp } from "../context/AppContext";
import { db } from "../services/firebase";
import { joinSpecialistRoom } from "../services/specialistRoomService";
import "../styles/RoomChat.css";

function RoomChat() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useApp();
  const messagesEndRef = useRef(null);
  const isSpecialist = user?.tipoCuenta === "especialista" || user?.rol === "especialista";
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId || !user?.uid) return undefined;

    let cancelled = false;
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");
        const roomSnap = await getDoc(doc(db, "salas_especialistas", roomId));

        if (cancelled) return;
        if (!roomSnap.exists()) {
          setError("La sala no existe o ya fue eliminada.");
          setRoom(null);
          return;
        }

        const roomData = roomSnap.data();
        const isOwner = roomData.especialistaId === user.uid;
        const isAssignedUser = roomData.usuarioId === user.uid;
        const isUnassigned = !roomData.usuarioId;

        if (!isSpecialist && !isOwner && !isAssignedUser && !isUnassigned) {
          setError("Esta sala ya está vinculada a otro usuario.");
          setRoom(null);
          return;
        }

        if (isSpecialist && !isOwner) {
          setError("No tienes permiso para acceder a esta sala.");
          setRoom(null);
          return;
        }

        setRoom({ id: roomSnap.id, ...roomData });
      } catch (loadError) {
        console.error("Error cargando sala privada:", loadError);
        setError("No pudimos abrir esta sala. Verifica el código y tu sesión.");
        setRoom(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoom();
    return () => {
      cancelled = true;
    };
  }, [isSpecialist, roomId, user?.uid]);

  useEffect(() => {
    if (!room?.id || !user?.uid) return undefined;
    const canInteract = isSpecialist
      ? room.especialistaId === user.uid
      : room.usuarioId === user.uid;

    if (!canInteract) {
      setMessages([]);
      return undefined;
    }

    const messagesRef = collection(db, "salas_especialistas", room.id, "mensajes");
    return onSnapshot(
      messagesRef,
      (snapshot) => {
        const nextMessages = snapshot.docs
          .map((messageDoc) => {
            const data = messageDoc.data();
            return {
              id: messageDoc.id,
              ...data,
              text: data.texto || "",
              sender: data.remitenteId === user.uid ? "user" : "specialist",
              time: data.fecha?.toDate
                ? data.fecha.toDate().toLocaleTimeString("es-NI", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Ahora",
            };
          })
          .sort((a, b) => (a.fecha?.toMillis?.() || 0) - (b.fecha?.toMillis?.() || 0));

        setMessages(nextMessages);
      },
      (snapshotError) => {
        console.error("Error escuchando mensajes de la sala:", snapshotError);
        setError("No pudimos cargar los mensajes de esta sala.");
      }
    );
  }, [isSpecialist, room?.id, room?.usuarioId, user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!room?.id || !user?.uid || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (item) => item.remitenteId !== user.uid && item.leido === false
    );

    if (unreadMessages.length === 0) return;

    Promise.all(
      unreadMessages.map((item) =>
        updateDoc(doc(db, "salas_especialistas", room.id, "mensajes", item.id), {
          leido: true,
        })
      )
    )
      .then(() => updateDoc(doc(db, "salas_especialistas", room.id), {
        [isSpecialist ? "mensajesNoLeidos" : "mensajesNoLeidosUsuario"]: 0,
      }))
      .catch((readError) => console.error("Error marcando sala como leída:", readError));
  }, [isSpecialist, messages, room?.id, user?.uid]);

  const counterpart = useMemo(() => {
    if (!room) return null;

    return isSpecialist
      ? {
          nombre: room.usuarioNombre || "Usuario FeelSafe",
          fotoPerfil: room.usuarioFoto || "",
          status: "Sala privada",
        }
      : {
          nombre: room.especialistaNombre || "Especialista FeelSafe",
          fotoPerfil: room.especialistaFoto || "",
          status: "Sala privada",
        };
  }, [isSpecialist, room]);

  const handleJoin = async () => {
    if (joining || !user?.uid) return;

    try {
      setJoining(true);
      setError("");
      const joinedRoom = await joinSpecialistRoom(roomId, user);
      setRoom((currentRoom) => ({ ...currentRoom, ...joinedRoom }));
    } catch (joinError) {
      setError(joinError.message || "No pudimos vincularte a esta sala.");
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async () => {
    const text = message.trim().slice(0, 2000);
    const canInteract = room && (isSpecialist ? room.especialistaId === user?.uid : room.usuarioId === user?.uid);

    if (!text || sending || !canInteract) return;

    try {
      setSending(true);
      await addDoc(collection(db, "salas_especialistas", room.id, "mensajes"), {
        texto: text,
        remitenteId: user.uid,
        remitenteTipo: isSpecialist ? "especialista" : "usuario",
        destinatarioId: isSpecialist ? room.usuarioId : room.especialistaId,
        fecha: serverTimestamp(),
        leido: false,
      });

      await updateDoc(doc(db, "salas_especialistas", room.id), {
        ultimoMensaje: text,
        ultimoEmisorId: user.uid,
        fechaUltimoMensaje: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        mensajesNoLeidos: isSpecialist ? 0 : increment(1),
        mensajesNoLeidosUsuario: isSpecialist ? increment(1) : 0,
      });

      setMessage("");
    } catch (sendError) {
      console.error("Error enviando mensaje de sala:", sendError);
      setError("No pudimos enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const backPath = isSpecialist ? "/specialist/rooms" : "/conversations";
  const Layout = isSpecialist ? SpecialistLayout : MainLayout;
  const isUnassignedUser = !isSpecialist && room && !room.usuarioId;

  return (
    <Layout>
      <div className="room-chat-page">
        <div className="room-chat-shell">
          <div className="room-chat-toolbar">
            <button type="button" onClick={() => navigate(backPath)} aria-label="Volver">
              <FaArrowLeft aria-hidden="true" /> Volver
            </button>
            <span><FaKey aria-hidden="true" /> Código: {room?.codigo || roomId}</span>
          </div>

          {loading ? (
            <div className="room-chat-state">Cargando sala privada...</div>
          ) : error && !room ? (
            <div className="room-chat-state room-chat-error" role="alert">
              <FaDoorOpen aria-hidden="true" />
              <h2>No se puede abrir la sala</h2>
              <p>{error}</p>
              <button type="button" onClick={() => navigate(backPath)}>Volver</button>
            </div>
          ) : room ? (
            <>
              <ChatHeader specialist={counterpart} />
              {error && <p className="room-chat-inline-error" role="alert">{error}</p>}
              {isUnassignedUser ? (
                <div className="room-chat-state">
                  <FaKey aria-hidden="true" />
                  <h2>Sala privada disponible</h2>
                  <p>Confirma que deseas vincular tu cuenta a esta sala. Solo tú y el especialista podrán escribir aquí.</p>
                  <button type="button" onClick={handleJoin} disabled={joining}>
                    {joining ? "Vinculando..." : "Unirme a la sala"}
                  </button>
                </div>
              ) : (
                <>
                  <MessageList messages={messages} />
                  <div ref={messagesEndRef} />
                  <ChatInput message={message} setMessage={setMessage} onSend={handleSend} disabled={sending} />
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

export default RoomChat;
