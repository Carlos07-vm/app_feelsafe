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

const COLECCION = "recursos";

// Crear un recurso
export const crearRecurso = async ({
  titulo,
  descripcion,
  categoria,
  enlace,
}) => {
  try {
    const recurso = {
      titulo,
      descripcion,
      categoria,
      enlace: enlace || "",
      estado: "Activo",
      fechaCreacion: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      recurso
    );

    return {
      success: true,
      id: documento.id,
      data: recurso,
    };
  } catch (error) {
    console.error(
      "Error al crear recurso:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener recursos
export const obtenerRecursos = async (
  categoria = null
) => {
  try {
    let consulta;

    if (categoria) {
      consulta = query(
        collection(db, COLECCION),
        where("categoria", "==", categoria),
        where("estado", "==", "Activo"),
        orderBy("fechaCreacion", "desc")
      );
    } else {
      consulta = query(
        collection(db, COLECCION),
        where("estado", "==", "Activo"),
        orderBy("fechaCreacion", "desc")
      );
    }

    const resultado = await getDocs(consulta);

    const recursos = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    return {
      success: true,
      data: recursos,
    };
  } catch (error) {
    console.error(
      "Error al obtener recursos:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

