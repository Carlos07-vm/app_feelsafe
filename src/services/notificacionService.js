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

const COLECCION = "notificaciones";

// Crear una notificación
export const crearNotificacion = async ({
  uidUsuario,
  titulo,
  mensaje,
}) => {
  try {
    const notificacion = {
      uidUsuario,
      titulo,
      mensaje,
      leida: false,
      fecha: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      notificacion
    );

    return {
      success: true,
      id: documento.id,
      data: notificacion,
    };
  } catch (error) {
    console.error(
      "Error al crear notificación:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener notificaciones de un usuario
export const obtenerNotificaciones = async (
  uidUsuario
) => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where("uidUsuario", "==", uidUsuario)
    );

    const resultado = await getDocs(consulta);

    let notificaciones = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    // Ordenar en el cliente por fecha descendente
    notificaciones.sort((a, b) => {
      const dateA = new Date(b.fecha || 0).getTime();
      const dateB = new Date(a.fecha || 0).getTime();
      return dateA - dateB;
    });

    return {
      success: true,
      data: notificaciones,
    };
  } catch (error) {
    console.error(
      "Error al obtener notificaciones:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// Marcar una notificación como leída
export const marcarNotificacionLeida = async (
  idNotificacion
) => {
  try {
    await updateDoc(
      doc(db, COLECCION, idNotificacion),
      {
        leida: true,
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Error al marcar notificación:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};
