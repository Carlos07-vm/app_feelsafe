import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const COLECCION = "configuraciones";

// Obtener configuración de un usuario
export const obtenerConfiguracion = async (
  uidUsuario
) => {
  try {
    const referencia = doc(
      db,
      COLECCION,
      uidUsuario
    );

    const resultado = await getDoc(referencia);

    if (!resultado.exists()) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: resultado.id,
        ...resultado.data(),
      },
    };
  } catch (error) {
    console.error(
      "Error al obtener configuración:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// Guardar configuración de un usuario
export const guardarConfiguracion = async ({
  uidUsuario,
  tema,
  idioma,
  notificaciones,
}) => {
  try {
    const configuracion = {
      uidUsuario,
      tema,
      idioma,
      notificaciones,
      fechaActualizacion: serverTimestamp(),
    };

    await setDoc(
      doc(db, COLECCION, uidUsuario),
      configuracion,
      { merge: true }
    );

    return {
      success: true,
      data: configuracion,
    };
  } catch (error) {
    console.error(
      "Error al guardar configuración:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};
