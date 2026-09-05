import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

const COLECCION = "conversaciones";

// ==========================================
// CREAR CONVERSACIÓN
// ==========================================
export const crearConversacion = async ({
  uidUsuario,
  titulo = "Nueva conversación",
}) => {
  try {
    const conversacion = {
      uidUsuario,
      titulo,
      estado: "Activa",
      fechaInicio: serverTimestamp(),
      fechaUltimoMensaje: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      conversacion
    );

    console.log(
      "Conversación creada:",
      documento.id
    );

    return {
      success: true,
      id: documento.id,
      data: conversacion,
    };
  } catch (error) {
    console.error(
      "Error al crear conversación:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};


// ==========================================
// OBTENER CONVERSACIONES DEL USUARIO
// ==========================================
export const obtenerConversaciones = async (
  uidUsuario
) => {
  try {
    // Query sin orderBy para evitar requerir índices compuestos
    const consulta = query(
      collection(db, COLECCION),
      where(
        "uidUsuario",
        "==",
        uidUsuario
      )
    );

    const resultado = await getDocs(
      consulta
    );

    let conversaciones =
      resultado.docs.map(
        (documento) => ({
          id: documento.id,
          ...documento.data(),
        })
      );

    // Ordenar en el cliente por fechaUltimoMensaje descendente
    conversaciones.sort((a, b) => {
      const dateA = new Date(b.fechaUltimoMensaje || 0).getTime();
      const dateB = new Date(a.fechaUltimoMensaje || 0).getTime();
      return dateA - dateB;
    });

    return {
      success: true,
      data: conversaciones,
    };
  } catch (error) {
    console.error(
      "Error al obtener conversaciones:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};


// ==========================================
// ACTUALIZAR ÚLTIMO MENSAJE
// ==========================================
export const actualizarUltimoMensaje =
  async (idConversacion) => {
    try {
      await updateDoc(
        doc(
          db,
          COLECCION,
          idConversacion
        ),
        {
          fechaUltimoMensaje:
            serverTimestamp(),
        }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Error al actualizar conversación:",
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  };
