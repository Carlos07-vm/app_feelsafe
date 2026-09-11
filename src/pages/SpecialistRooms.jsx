import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { FaCopy, FaDoorOpen, FaKey, FaPlus, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import SpecialistLayout from "../components/SpecialistLayout";
import { useApp } from "../context/AppContext";
import { db } from "../services/firebase";
import { createSpecialistRoom } from "../services/specialistRoomService";
import "../styles/SpecialistRooms.css";

function SpecialistRooms() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [rooms, setRooms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid) return undefined;

    const roomsQuery = query(
      collection(db, "salas_especialistas"),
      where("especialistaId", "==", user.uid)
    );

    return onSnapshot(
      roomsQuery,
      (snapshot) => {
        const nextRooms = snapshot.docs
          .map((roomDoc) => ({ id: roomDoc.id, ...roomDoc.data() }))
          .sort((a, b) => {
            const timeA = a.fechaCreacion?.toMillis?.() || 0;
            const timeB = b.fechaCreacion?.toMillis?.() || 0;
            return timeB - timeA;
          });

        setRooms(nextRooms);
      },
      (snapshotError) => {
        console.error("Error cargando salas privadas:", snapshotError);
        setError("No pudimos cargar tus salas privadas.");
      }
    );
  }, [user?.uid]);

  const handleCreateRoom = async () => {
    if (creating) return;

    try {
      setCreating(true);
      setError("");
      await createSpecialistRoom({
        uid: user.uid,
        nombre: user.nombre || user.displayName,
        fotoPerfil: user.fotoPerfil || user.foto || user.photoURL,
      });
    } catch (createError) {
      console.error("Error creando sala privada:", createError);
      setError(createError.message || "No pudimos crear la sala.");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("No se pudo copiar el código. Puedes seleccionarlo manualmente.");
    }
  };

  return (
    <SpecialistLayout>
      <div className="specialist-rooms-page">
        <header className="specialist-rooms-header">
          <div>
            <span className="specialist-rooms-eyebrow">ATENCIÓN PRIVADA</span>
            <h1>Salas con código</h1>
            <p>Crea una sala y comparte su código con un único usuario. Solo las personas vinculadas podrán leer y enviar mensajes.</p>
          </div>
          <div className="specialist-rooms-header-icon" aria-hidden="true"><FaDoorOpen /></div>
        </header>

        <section className="specialist-room-create-card" aria-labelledby="create-room-title">
          <div className="specialist-room-create-icon" aria-hidden="true"><FaKey /></div>
          <div>
            <h2 id="create-room-title">Crear una sala privada</h2>
            <p>Generaremos un código de seis caracteres listo para compartir.</p>
          </div>
          <button type="button" onClick={handleCreateRoom} disabled={creating}>
            <FaPlus aria-hidden="true" /> {creating ? "Creando..." : "Nueva sala"}
          </button>
        </section>

        {error && <p className="specialist-rooms-error" role="alert">{error}</p>}

        <section className="specialist-rooms-list" aria-labelledby="rooms-list-title">
          <div className="specialist-rooms-section-heading">
            <div>
              <span className="specialist-rooms-eyebrow">TUS SALAS</span>
              <h2 id="rooms-list-title">Salas creadas</h2>
            </div>
            <span className="specialist-room-count">{rooms.length}</span>
          </div>

          {rooms.length === 0 ? (
            <div className="specialist-rooms-empty">
              <FaDoorOpen aria-hidden="true" />
              <h3>Aún no has creado salas</h3>
              <p>Crea una sala para atender a un usuario de forma privada.</p>
            </div>
          ) : (
            <div className="specialist-room-cards">
              {rooms.map((room) => {
                const assigned = Boolean(room.usuarioId);

                return (
                  <article className="specialist-room-card" key={room.id}>
                    <div className="specialist-room-card-top">
                      <div className="specialist-room-card-icon" aria-hidden="true"><FaKey /></div>
                      <div>
                        <span className="specialist-room-card-label">Código de sala</span>
                        <strong>{room.codigo || room.id}</strong>
                      </div>
                      <button type="button" className="specialist-room-copy" onClick={() => copyCode(room.codigo || room.id)} aria-label="Copiar código de sala">
                        <FaCopy aria-hidden="true" />
                        {copiedCode === (room.codigo || room.id) ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                    <div className="specialist-room-card-status">
                      <FaUser aria-hidden="true" />
                      {assigned ? `Vinculada a ${room.usuarioNombre || "un usuario"}` : "Esperando a un usuario"}
                    </div>
                    <button type="button" className="specialist-room-open" onClick={() => navigate(`/specialist-room/${room.id}`)}>
                      Abrir sala
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistRooms;
