import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";
import { crearUsuario } from "./usuarioService";

/**
 * REGISTRAR USUARIO
 */
export const register = async (name, email, password) => {
  try {
    // Crear usuario en Firebase Authentication
    const resultado = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const usuario = resultado.user;

    // Guardar nombre en Firebase Authentication
    await updateProfile(usuario, {
      displayName: name,
    });

    // Crear documento en Firestore
    await crearUsuario(usuario.uid, {
      nombre: name,
      correo: email,
      fotoPerfil: "",
      proveedor: "correo",
     correoVerificado: usuario.emailVerified,
      edad: 0,
      genero: "",
      pais: "Nicaragua",
      ciudad: "",
      telefono: "",
      biografia: "",
      racha: 0,
      puntos: 0,
      nivel: 1,
      esPremium: false,
      estado: "activo",
      rol: "usuario",
    });

    return {
      success: true,
      user: usuario,
      message: "Cuenta creada correctamente",
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return {
      success: false,
      error: error.code,
      message: obtenerMensajeError(error.code),
    };
  }
};

/**
 * INICIAR SESIÓN
 */
export const login = async (email, password) => {
  try {
    const resultado = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: resultado.user,
      message: "Sesión iniciada correctamente",
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return {
      success: false,
      error: error.code,
      message: obtenerMensajeError(error.code),
    };
  }
};

/**
 * CERRAR SESIÓN
 */
export const logout = async () => {
  try {
    await signOut(auth);

    return {
      success: true,
      message: "Sesión cerrada correctamente",
    };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    return {
      success: false,
      error: error.code,
      message: "No se pudo cerrar la sesión",
    };
  }
};

/**
 * MENSAJES DE ERROR
 */
const obtenerMensajeError = (codigo) => {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";

    case "auth/invalid-email":
      return "El correo electrónico no es válido.";

    case "auth/weak-password":
      return "La contraseña es demasiado débil.";

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