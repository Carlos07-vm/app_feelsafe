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

const COLECCION = "ejercicios_respiracion";

// Crear ejercicio de respiración
export const crearEjercicioRespiracion = async ({
  nombre,
  descripcion,
  duracion,
  instrucciones,
}) => {
  try {
    const ejercicio = {
      nombre,
      descripcion,
      duracion,
      instrucciones,
      estado: "Activo",
      fechaCreacion: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      ejercicio
    );

    return {
      success: true,
      id: documento.id,
      data: ejercicio,
    };
  } catch (error) {
    console.error(
      "Error al crear ejercicio de respiración:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// Obtener ejercicios de respiración
export const obtenerEjerciciosRespiracion = async () => {
  try {
    const consulta = query(
      collection(db, COLECCION),
      where("estado", "==", "Activo"),
      orderBy("fechaCreacion", "desc")
    );

    const resultado = await getDocs(consulta);

    const ejercicios = resultado.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    return {
      success: true,
      data: ejercicios,
    };
  } catch (error) {
    console.error(
      "Error al obtener ejercicios de respiración:",
      error
    );

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};