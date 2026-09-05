import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

const COLECCION = "favoritos";

// Crear un favorito
export const crearFavorito = async ({
  uidUsuario,
  idRecurso,
}) => {
  try {
    const favorito = {
      uidUsuario,
      idRecurso,
      fecha: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      favorito
    );

    return {
      success: true,
      id: documento.id,
      data: favorito,
    };
  } catch (error) {
    console.error(
      "Error al crear favorito:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener favoritos de un usuario
export const obtenerFavoritos = async (
  uidUsuario
) => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where("uidUsuario", "==", uidUsuario)
    );

    const resultado = await getDocs(consulta);

    let favoritos = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    // Ordenar en el cliente por fecha descendente
    favoritos.sort((a, b) => {
      const dateA = new Date(b.fecha || 0).getTime();
      const dateB = new Date(a.fecha || 0).getTime();
      return dateA - dateB;
    });

    return {
      success: true,
      data: favoritos,
    };
  } catch (error) {
    console.error(
      "Error al obtener favoritos:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// Eliminar un favorito
export const eliminarFavorito = async (
  idFavorito
) => {
  try {
    await deleteDoc(
      doc(db, COLECCION, idFavorito)
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Error al eliminar favorito:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

