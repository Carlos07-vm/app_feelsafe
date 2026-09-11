import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const COLECCION = "recomendaciones";

// Crear una recomendación
export const crearRecomendacion = async ({
  titulo,
  descripcion,
  categoria,
  emocion,
}) => {
  try {
    const recomendacion = {
      titulo,
      descripcion,
      categoria,
      emocion,
      estado: "Activo",
      fechaCreacion: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      recomendacion
    );

    return {
      success: true,
      id: documento.id,
      data: recomendacion,
    };
  } catch (error) {
    console.error(
      "Error al crear recomendación:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener recomendaciones
export const obtenerRecomendaciones = async (
  emocion = null
) => {
  try {
    let consulta;

    if (emocion) {
      consulta = query(
        collection(db, COLECCION),
        where("emocion", "==", emocion),
        where("estado", "==", "Activo")
      );
    } else {
      consulta = query(
        collection(db, COLECCION),
        where("estado", "==", "Activo")
      );
    }

    const resultado = await getDocs(consulta);

    let recomendaciones = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    // Ordenar en el cliente por fechaCreacion descendente
    recomendaciones.sort((a, b) => {
      const dateA = new Date(b.fechaCreacion || 0).getTime();
      const dateB = new Date(a.fechaCreacion || 0).getTime();
      return dateA - dateB;
    });

    return {
      success: true,
      data: recomendaciones,
    };
  } catch (error) {
    console.error(
      "Error al obtener recomendaciones:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};
