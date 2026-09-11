import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "./firebase";

import {
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { publicSpecialistData } from "../utils/specialist";
import { retirarTokenFCM } from "./messaging";

/**
 * =====================================================
 * REGISTRAR USUARIO
 * =====================================================
 */
export const register = async (
  name,
  email,
  password,
  rol = "usuario"
) => {
  try {
    // -----------------------------------------------
    // CREAR CUENTA EN FIREBASE AUTH
    // -----------------------------------------------

    const resultado =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const usuario = resultado.user;

    // -----------------------------------------------
    // GUARDAR NOMBRE EN AUTH
    // -----------------------------------------------

    await updateProfile(usuario, {
      displayName: name,
    });

    // -----------------------------------------------
    // DATOS COMUNES
    // -----------------------------------------------

    const datosBase = {
      uid: usuario.uid,
      nombre: name,
      correo: email,
      proveedor: "correo",
      correoVerificado: usuario.emailVerified,
      fechaRegistro: serverTimestamp(),
      estado: "Pendiente",
      rol: rol,
      tipoCuenta: rol,
      accountType: rol,
    };

    // -----------------------------------------------
    // SI ES ESPECIALISTA
    // -----------------------------------------------

    if (rol === "especialista") {
      const specialistData = {
        ...datosBase,
        especialidad: "",
        disponible: false,
        descripcion: "",
        telefono: "",
        ciudad: "",
        fotoPerfil: "",
      };
      const batch = writeBatch(db);
      batch.set(doc(db, "specialists", usuario.uid), specialistData);
      batch.set(
        doc(db, "specialists_public", usuario.uid),
        publicSpecialistData(usuario.uid, specialistData)
      );
      await batch.commit();

    }

    // -----------------------------------------------
    // SI ES USUARIO
    // -----------------------------------------------

    else {

      await setDoc(
        doc(
          db,
          "usuarios",
          usuario.uid
        ),
        {
          ...datosBase,

           foto: "",
           tipoCuenta: "usuario",
           accountType: "usuario",
           telefono: "",
          fechaNacimiento: "",

          edad: 0,
          genero: "",
          pais: "Nicaragua",

          racha: 0,
          puntos: 0,
          nivel: 1,
           esPremium: false,
           wellbeing: 72,
           streak: 0,
           currentMood: "Neutral",
           notes: [],
           emotions: [],
         }
      );

    }

    return {
      success: true,
      user: usuario,
      rol: rol,
      message: "Cuenta creada correctamente",
    };

  } catch (error) {

    console.error(
      "Error al registrar usuario:",
      error
    );

    return {
      success: false,
      error: error.code,
      message: obtenerMensajeError(
        error.code
      ),
    };
  }
};


/**
 * =====================================================
 * INICIAR SESIÓN
 * =====================================================
 */
export const login = async (
  email,
  password
) => {

  try {

    const resultado =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return {
      success: true,
      user: resultado.user,
      message:
        "Sesión iniciada correctamente",
    };

  } catch (error) {

    console.error(
      "Error al iniciar sesión:",
      error
    );

    return {
      success: false,
      error: error.code,
      message: obtenerMensajeError(
        error.code
      ),
    };
  }
};


/**
 * =====================================================
 * CERRAR SESIÓN
 * =====================================================
 */
export const logout = async () => {

  try {

    await retirarTokenFCM(auth.currentUser);
    await signOut(auth);

    return {
      success: true,
      message:
        "Sesión cerrada correctamente",
    };

  } catch (error) {

    console.error(
      "Error al cerrar sesión:",
      error
    );

    return {
      success: false,
      error: error.code,
      message:
        "No se pudo cerrar la sesión",
    };
  }
};


/**
 * =====================================================
 * MENSAJES DE ERROR
 * =====================================================
 */
const obtenerMensajeError = (
  codigo
) => {

  switch (codigo) {

    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";

    case "auth/invalid-email":
      return "El correo electrónico no es válido.";

    case "auth/weak-password":
      return "La contraseña debe tener al menos 8 caracteres.";

    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";

    case "auth/user-not-found":
      return "No existe una cuenta con este correo.";

    case "auth/wrong-password":
      return "La contraseña es incorrecta.";

    default:
      return "Ocurrió un error. Inténtalo nuevamente.";
  }
};
