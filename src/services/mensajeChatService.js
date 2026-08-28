import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db, auth } from "./firebase";

const COLECCION = "mensajes_chat";

// ==========================================
// CREAR MENSAJE DEL CHAT
// ==========================================
export const crearMensajeChat = async ({
  idConversacion,
  uidUsuario,
  remitente,
  mensaje,
}) => {
  try {
    const nuevoMensaje = {
      idConversacion,
      uidUsuario,
      remitente,
      mensaje,
      fecha: serverTimestamp(),
    };

    const documento = await addDoc(
      collection(db, COLECCION),
      nuevoMensaje
    );

    console.log(
      "Mensaje guardado:",
      documento.id
    );

    return {
      success: true,
      id: documento.id,
      data: nuevoMensaje,
    };
  } catch (error) {
    console.error(
      "Error al crear mensaje:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};


// ==========================================
// OBTENER MENSAJES DE UNA CONVERSACIÓN
// ==========================================
export const obtenerMensajesChat = async (
  idConversacion
) => {
  try {
    const usuarioActual =
      auth.currentUser;

    if (!usuarioActual) {
      throw new Error(
        "No hay un usuario autenticado."
      );
    }

    // ==================================================
    // IMPORTANTE:
    // Filtramos por conversación Y por usuario.
    //
    // Esto permite que Firestore pueda comprobar
    // correctamente las reglas de seguridad.
    // ==================================================

    const consulta = query(
      collection(db, COLECCION),

      where(
        "idConversacion",
        "==",
        idConversacion
      ),

      where(
        "uidUsuario",
        "==",
        usuarioActual.uid
      )
    );

    const resultado =
      await getDocs(consulta);

    const mensajes =
      resultado.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .sort((a, b) => {
          const fechaA =
            a.fecha?.toMillis
              ? a.fecha.toMillis()
              : 0;

          const fechaB =
            b.fecha?.toMillis
              ? b.fecha.toMillis()
              : 0;

          return fechaA - fechaB;
        });

    console.log(
      "Mensajes encontrados:",
      mensajes.length
    );

    return {
      success: true,
      data: mensajes,
    };
  } catch (error) {
    console.error(
      "Error al obtener mensajes:",
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
// ELIMINAR MENSAJES DE UNA CONVERSACIÓN
// ==========================================
export const eliminarMensajesChat = async (
  idConversacion
) => {
  try {
    const usuarioActual =
      auth.currentUser;

    if (!usuarioActual) {
      throw new Error(
        "No hay un usuario autenticado."
      );
    }

    // ==================================================
    // IMPORTANTE:
    // También filtramos por uidUsuario.
    // ==================================================

    const consulta = query(
      collection(db, COLECCION),

      where(
        "idConversacion",
        "==",
        idConversacion
      ),

      where(
        "uidUsuario",
        "==",
        usuarioActual.uid
      )
    );

    const resultado =
      await getDocs(consulta);

    console.log(
      "Mensajes encontrados para eliminar:",
      resultado.docs.length
    );

    // ==================================================
    // ELIMINAR TODOS LOS MENSAJES ENCONTRADOS
    // ==================================================

    const eliminaciones =
      resultado.docs.map(
        (documento) =>
          deleteDoc(
            doc(
              db,
              COLECCION,
              documento.id
            )
          )
      );

    await Promise.all(eliminaciones);

    console.log(
      "Mensajes eliminados correctamente."
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Error al eliminar mensajes:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};