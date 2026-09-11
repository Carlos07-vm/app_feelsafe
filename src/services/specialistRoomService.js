import {
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;

export const normalizeRoomCode = (value = "") =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, ROOM_CODE_LENGTH);

const randomRoomCode = () => {
  const values = new Uint32Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join("");
};

export async function createSpecialistRoom(specialist) {
  if (!specialist?.uid) {
    throw new Error("No se pudo identificar al especialista.");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomRoomCode();
    const roomRef = doc(db, "salas_especialistas", code);

    const room = {
      codigo: code,
      titulo: specialist.titulo || "Sala privada de acompañamiento",
      estado: "Activa",
      especialistaId: specialist.uid,
      especialistaNombre: specialist.nombre || specialist.displayName || "Especialista",
      especialistaFoto: specialist.fotoPerfil || specialist.foto || specialist.photoURL || "",
      usuarioId: "",
      usuarioNombre: "",
      usuarioFoto: "",
      ultimoMensaje: "",
      ultimoEmisorId: "",
      mensajesNoLeidos: 0,
      mensajesNoLeidosUsuario: 0,
      fechaUltimoMensaje: null,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    };

    try {
      await setDoc(roomRef, room);
      return { id: code, ...room };
    } catch (error) {
      // A collision is exceptionally unlikely; retry with another code.
      if (attempt === 4) throw error;
    }
  }

  throw new Error("No se pudo generar un código único. Inténtalo de nuevo.");
}

export async function joinSpecialistRoom(value, user) {
  const code = normalizeRoomCode(value);

  if (code.length !== ROOM_CODE_LENGTH) {
    throw new Error("El código debe tener 6 caracteres.");
  }

  if (!user?.uid) {
    throw new Error("Debes iniciar sesión para unirte a una sala.");
  }

  const roomRef = doc(db, "salas_especialistas", code);
  return runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);

    if (!roomSnap.exists()) {
      throw new Error("No encontramos una sala con ese código.");
    }

    const room = roomSnap.data();

    if (room.especialistaId === user.uid) {
      throw new Error("Esta sala pertenece a tu cuenta profesional.");
    }

    if (room.usuarioId && room.usuarioId !== user.uid) {
      throw new Error("Esta sala ya está vinculada a otro usuario.");
    }

    if (!room.usuarioId) {
      transaction.update(roomRef, {
        usuarioId: user.uid,
        usuarioNombre: user.displayName || user.nombre || user.email || "Usuario FeelSafe",
        usuarioFoto: user.photoURL || user.foto || user.fotoPerfil || "",
        fechaActualizacion: serverTimestamp(),
      });
    }

    return { id: code, ...room, usuarioId: user.uid };
  });
}
