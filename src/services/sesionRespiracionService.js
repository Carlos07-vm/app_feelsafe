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

const COLECCION = "sesiones_respiracion";

// Crear una sesión de respiración
export const crearSesionRespiracion = async ({
  uidUsuario,
  idEjercicio,
  duracion,
  completada,
}) => {
  try {
    const sesion = {
      uidUsuario,
      idEjercicio,
      duracion,
      completada,
      fecha: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      sesion
    );

    return {
      success: true,
      id: documento.id,
      data: sesion,
    };
  } catch (error) {
    console.error(
      "Error al crear sesión de respiración:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener sesiones de respiración de un usuario
export const obtenerSesionesRespiracion = async (
  uidUsuario
) => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where("uidUsuario", "==", uidUsuario),
      orderBy("fecha", "desc")
    );

    const resultado = await getDocs(consulta);

    const sesiones = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    return {
      success: true,
      data: sesiones,
    };
  } catch (error) {
    console.error(
      "Error al obtener sesiones de respiración:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

