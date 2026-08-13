import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const COLECCION = "mensajes_chat";

// ==========================================
// CREAR MENSAJE DEL CHAT
// ==========================================
export const crearMensajeChat = async ({
  idConversacion,
  uidUsuario,
  remitente,
  mensaje,
}) => {
  try {
    const nuevoMensaje = {
      idConversacion,
      uidUsuario,
      remitente,
      mensaje,
      fecha: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      nuevoMensaje
    );

    console.log(
      "Mensaje guardado correctamente:",
      documento.id
    );

    return {
      success: true,
      id: documento.id,
      data: nuevoMensaje,
    };
  } catch (error) {
    console.error(
      "Error al crear mensaje:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};


// ==========================================
// OBTENER MENSAJES DE UNA CONVERSACIÓN
// ==========================================
export const obtenerMensajesChat = async (
  idConversacion
) => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where(
        "idConversacion",
        "==",
        idConversacion
      ),
      orderBy("fecha", "asc")
    );

    const resultado = await getDocs(consulta);

    const mensajes = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    console.log(
      "Mensajes obtenidos:",
      mensajes.length
    );

    return {
      success: true,
      data: mensajes,
    };
  } catch (error) {
    console.error(
      "Error al obtener mensajes:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};