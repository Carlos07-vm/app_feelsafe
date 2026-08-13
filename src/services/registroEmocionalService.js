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

const COLECCION = "registros_emocionales";

// Crear un registro emocional
export const crearRegistroEmocional = async ({
  uidUsuario,
  emocion,
  intensidad,
  nota,
  fecha,
  hora,
}) => {
  try {
    const registro = {
      uidUsuario,
      emocion,
      intensidad,
      nota: nota || "",
      fecha,
      hora,
      fechaCreacion: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      registro
    );

    return {
      success: true,
      id: documento.id,
      data: registro,
    };
  } catch (error) {
    console.error(
      "Error al crear registro emocional:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener registros emocionales de un usuario
export const obtenerRegistrosEmocionales = async (
  uidUsuario
) => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where("uidUsuario", "==", uidUsuario),
      orderBy("fechaCreacion", "desc")
    );

    const resultado = await getDocs(consulta);

    const registros = resultado.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    return {
      success: true,
      data: registros,
    };
  } catch (error) {
    console.error(
      "Error al obtener registros emocionales:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};
