import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

/**
 * Referencia al documento del usuario
 */
const obtenerReferenciaUsuario = (uid) => {
  return doc(db, "usuarios", uid);
};

/**
 * Obtener los datos de un usuario
 */
export const obtenerUsuario = async (uid) => {
  try {
    const referencia = obtenerReferenciaUsuario(uid);
    const documento = await getDoc(referencia);

    if (documento.exists()) {
      return {
        id: documento.id,
        ...documento.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
};

/**
 * Crear usuario en Firestore
 */
export const crearUsuario = async (uid, datosUsuario) => {
  try {
    const referencia = obtenerReferenciaUsuario(uid);

    await setDoc(referencia, {
      uid,
      ...datosUsuario,
      fechaRegistro: serverTimestamp(),
      ultimoAcceso: serverTimestamp(),
    });

    return await obtenerUsuario(uid);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

/**
 * Actualizar datos del usuario
 */
export const actualizarUsuario = async (uid, datosUsuario) => {
  try {
    const referencia = obtenerReferenciaUsuario(uid);

    await updateDoc(referencia, {
      ...datosUsuario,
      ultimoAcceso: serverTimestamp(),
    });

    return await obtenerUsuario(uid);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

/**
 * Actualizar solamente el último acceso
 */
export const actualizarUltimoAcceso = async (uid) => {
  try {
    const referencia = obtenerReferenciaUsuario(uid);

    await updateDoc(referencia, {
      ultimoAcceso: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar último acceso:", error);
    throw error;
  }
};