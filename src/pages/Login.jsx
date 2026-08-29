import "../styles/Auth.css";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import { useState, useEffect } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

import logo from "../assets/logo.jpeg";


// =====================================================
// PROVIDERS
// =====================================================

const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider =
  new FacebookAuthProvider();


// =====================================================
// REDIRECCIÓN SEGÚN ROL
// =====================================================

const redirectByRole = async (
  user,
  navigate,
  setError
) => {

  try {

    // =================================================
    // 1. BUSCAR ESPECIALISTA
    // =================================================

    const specialistRef =
      doc(
        db,
        "specialists",
        user.uid
      );

    const specialistSnap =
      await getDoc(
        specialistRef
      );


    if (
      specialistSnap.exists()
    ) {

      navigate(
        "/specialist/dashboard",
        {
          replace: true,
        }
      );

      return true;
    }


    // =================================================
    // 2. BUSCAR USUARIO
    // =================================================

    const usuarioRef =
      doc(
        db,
        "usuarios",
        user.uid
      );

    const usuarioSnap =
      await getDoc(
        usuarioRef
      );


    if (
      usuarioSnap.exists()
    ) {

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

      return true;
    }


    // =================================================
    // 3. COMPATIBILIDAD CON users
    // =================================================

    const usersRef =
      doc(
        db,
        "users",
        user.uid
      );

    const usersSnap =
      await getDoc(
        usersRef
      );


    if (
      usersSnap.exists()
    ) {

      console.log(
        "✅ Usuario encontrado en users"
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

      return true;
    }


    // =================================================
    // NO EXISTE PERFIL
    // =================================================

    console.error(
      "❌ No existe perfil para:",
      user.uid
    );

    setError(
      "La cuenta existe, pero no tiene un perfil configurado."
    );

    return false;

  } catch (error) {

    console.error(
      "Error detectando rol:",
      error
    );

    setError(
      "No se pudo determinar el tipo de cuenta."
    );

    return false;
  }
};


// =====================================================
// COMPONENTE
// =====================================================

function Login() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [failedAttempts, setFailedAttempts] =
    useState(0);

  const [lockoutSeconds, setLockoutSeconds] =
    useState(0);

  const navigate =
    useNavigate();

  // Contador regresivo para bloqueo tras 5 intentos fallidos
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);


  // ===================================================
  // GOOGLE
  // ===================================================

  const loginGoogle =
    async () => {

      setError("");
      setLoading(true);

      try {

        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        const user =
          result.user;


        // =============================================
        // BUSCAR SI YA EXISTE ESPECIALISTA
        // =============================================

        const specialistRef =
          doc(
            db,
            "specialists",
            user.uid
          );

        const specialistSnap =
          await getDoc(
            specialistRef
          );


        // =============================================
        // SI ES ESPECIALISTA
        // =============================================

        if (
          specialistSnap.exists()
        ) {

          console.log(
            "Google → Especialista"
          );

          await setDoc(
            specialistRef,
            {
              ultimoAcceso:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );
         
      
          navigate(
            "/specialist/dashboard",

            {
              replace: true,
            }
          );

          return;
        }


        // =============================================
        // SI NO ES ESPECIALISTA → USUARIO
        // =============================================

        const userRef =
          doc(
            db,
            "usuarios",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );


        if (
          !userSnap.exists()
        ) {

          await setDoc(
            userRef,
            {

              uid:
                user.uid,

              nombre:
                user.displayName ||
                "",

              correo:
                user.email ||
                "",

              foto:
                user.photoURL ||
                "",

              proveedor:
                "Google",

              rol:
                "usuario",

              fechaRegistro:
                serverTimestamp(),

              ultimoAcceso:
                serverTimestamp(),

              estado:
                "Activo",
            }
          );

        } else {

          await setDoc(
            userRef,
            {
              ultimoAcceso:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        }


        console.log(
          "Google → Usuario"
        );


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error Google:",
          error
        );

        switch (
          error.code
        ) {

          case "auth/popup-closed-by-user":

            setError(
              "Se canceló el inicio de sesión."
            );

            break;


          case "auth/popup-blocked":

            setError(
              "El navegador bloqueó la ventana emergente."
            );

            break;


          default:

            setError(
              "No se pudo iniciar sesión con Google."
            );
        }

      } finally {

        setLoading(false);

      }
    };


  // ===================================================
  // FACEBOOK
  // ===================================================

  const loginFacebook =
    async () => {

      setError("");
      setLoading(true);

      try {

        const result =
          await signInWithPopup(
            auth,
            facebookProvider
          );

        const user =
          result.user;


        // =============================================
        // BUSCAR ESPECIALISTA
        // =============================================

        const specialistRef =
          doc(
            db,
            "specialists",
            user.uid
          );

        const specialistSnap =
          await getDoc(
            specialistRef
          );


        if (
          specialistSnap.exists()
        ) {

          await setDoc(
            specialistRef,
            {
              ultimoAcceso:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );

          console.log(
            "Facebook → Especialista"
          );

          navigate(
            "/specialist/dashboard",
            {
              replace: true,
            }
          );

          return;
        }


        // =============================================
        // USUARIO
        // =============================================

        const userRef =
          doc(
            db,
            "usuarios",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );


        if (
          !userSnap.exists()
        ) {

          await setDoc(
            userRef,
            {

              uid:
                user.uid,

              nombre:
                user.displayName ||
                "",

              correo:
                user.email ||
                "",

              foto:
                user.photoURL ||
                "",

              proveedor:
                "Facebook",

              rol:
                "usuario",

              telefono:
                "",

              fechaNacimiento:
                "",

              fechaRegistro:
                serverTimestamp(),

              ultimoAcceso:
                serverTimestamp(),

              estado:
                "Activo",
            }
          );

        } else {

          await setDoc(
            userRef,
            {
              ultimoAcceso:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        }


        console.log(
          "Facebook → Usuario"
        );


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error Facebook:",
          error
        );

        switch (
          error.code
        ) {

          case "auth/popup-closed-by-user":

            setError(
              "Se canceló el inicio de sesión."
            );

            break;


          case "auth/popup-blocked":

            setError(
              "El navegador bloqueó la ventana emergente."
            );

            break;


          default:

            setError(
              "No se pudo iniciar sesión con Facebook."
            );
        }

      } finally {

        setLoading(false);

      }
    };


  // ===================================================
  // CORREO + CONTRASEÑA
  // ===================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      if (lockoutSeconds > 0) {
        setError(`Demasiados intentos fallidos. Espera ${lockoutSeconds} segundos.`);
        return;
      }

      setLoading(true);
      setError("");


      try {

        const result =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const user =
          result.user;

        // Reiniciar contador de intentos en caso de éxito
        setFailedAttempts(0);

        // =============================================
        // DETECTAR ROL
        // =============================================

        await redirectByRole(
          user,
          navigate,
          setError
        );


      } catch (error) {

        console.error(
          "Error login:",
          error.code
        );

        // Contabilizar intento fallido
        const nuevosIntentos = failedAttempts + 1;
        setFailedAttempts(nuevosIntentos);

        if (nuevosIntentos >= 5) {
          setFailedAttempts(0);
          setLockoutSeconds(30);
          setError("Has superado el límite de 5 intentos. Formulario bloqueado por 30 segundos por seguridad.");
          return;
        }

        switch (
          error.code
        ) {

          case "auth/user-not-found":

            setError(
              `No existe una cuenta con ese correo. (Intento ${nuevosIntentos}/5)`
            );

            break;


          case "auth/wrong-password":

            setError(
              `La contraseña es incorrecta. (Intento ${nuevosIntentos}/5)`
            );

            break;


          case "auth/invalid-email":

            setError(
              "Correo electrónico inválido."
            );

            break;


          case "auth/invalid-credential":

            setError(
              `Correo o contraseña incorrectos. (Intento ${nuevosIntentos}/5)`
            );

            break;


          case "auth/too-many-requests":

            setLockoutSeconds(60);
            setError(
              "Demasiados intentos detectados por el servidor. Espera 60 segundos."
            );

            break;


          default:

            setError(
              "No se pudo iniciar sesión. Verifica tus datos."
            );
        }

      } finally {

        setLoading(false);

      }
    };


  // ===================================================
  // INTERFAZ
  // ===================================================

  return (

    <div className="auth-container">

      <div className="auth-card">

        <Link
          to="/"
          className="back-link"
        >
          ← Volver al inicio
        </Link>


        <div className="auth-logo">

          <img
            src={logo}
            alt="Logo FeelSafe"
            className="auth-logo-image"
          />

        </div>


        <h1>
          Bienvenido de nuevo
        </h1>


        <p>
          Inicia sesión para continuar
          cuidando tu bienestar emocional.
        </p>


        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            disabled={loading || lockoutSeconds > 0}
            required
          />


          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            disabled={loading || lockoutSeconds > 0}
            required
          />


          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
          >

            {lockoutSeconds > 0
              ? `Bloqueado (${lockoutSeconds}s)`
              : loading
              ? "Ingresando..."
              : "Iniciar sesión"}

          </button>


          <div className="divider">

            <span>
              o continuar con
            </span>

          </div>


          <button
            type="button"
            onClick={
              loginGoogle
            }
            className="google-btn"
            disabled={loading}
          >

            <FcGoogle
              size={22}
            />

            <span>
              Continuar con Google
            </span>

          </button>


          <button
            type="button"
            onClick={
              loginFacebook
            }
            className="facebook-btn"
            disabled={loading}
          >

            <FaFacebook
              size={22}
              color="#1877F2"
            />

            <span>
              Continuar con Facebook
            </span>

          </button>

        </form>


        {error && (

          <p className="auth-error">
            {error}
          </p>

        )}


        <p className="auth-link">

          ¿Aún no tienes una cuenta?

          <Link to="/register">
            {" "}Crear cuenta
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;