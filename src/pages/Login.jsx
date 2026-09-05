import "../styles/Auth.css";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import { useState, useEffect } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useApp } from "../context/AppContext";

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

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();

// =====================================================
// REDIRECCIÓN SEGÚN ROL
// =====================================================

const redirectByRole = async (
  user,
  navigate,
  setError
) => {
  try {
    if (!user || !user.uid) {
      console.error("❌ Usuario Firebase inválido:", user);

      setError(
        "No se pudo obtener la información de la cuenta."
      );

      return false;
    }

    console.log("=================================");
    console.log("👤 USUARIO AUTENTICADO");
    console.log("UID:", user.uid);
    console.log("EMAIL:", user.email);
    console.log("=================================");

    // =================================================
    // 1. BUSCAR ESPECIALISTA
    // =================================================

    const specialistRef = doc(
      db,
      "specialists",
      user.uid
    );

    const specialistSnap = await getDoc(
      specialistRef
    );

    if (specialistSnap.exists()) {
      console.log("✅ Cuenta especialista");

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

    const usuarioRef = doc(
      db,
      "usuarios",
      user.uid
    );

    const usuarioSnap = await getDoc(
      usuarioRef
    );

    if (usuarioSnap.exists()) {
      console.log("✅ Cuenta usuario");

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

    const usersRef = doc(
      db,
      "users",
      user.uid
    );

    const usersSnap = await getDoc(
      usersRef
    );

    if (usersSnap.exists()) {
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
    // 4. NO EXISTE PERFIL
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
      "❌ Error detectando rol:",
      error
    );

    setError(
      "No se pudo determinar el tipo de cuenta."
    );

    return false;
  }
};

// =====================================================
// COMPONENTE LOGIN
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

  const {
    user: currentUser,
    loading: authLoading,
  } = useApp();

  // =====================================================
  // SESIÓN YA EXISTENTE
  // =====================================================

  useEffect(() => {

    if (
      !authLoading &&
      currentUser
    ) {

      console.log(
        "✅ Sesión existente detectada"
      );

      if (
        currentUser.tipoCuenta === "especialista" ||
        currentUser.rol === "especialista"
      ) {

        navigate(
          "/specialist/dashboard",
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      }
    }

  }, [
    currentUser,
    authLoading,
    navigate,
  ]);

  // =====================================================
  // CONTADOR DE BLOQUEO
  // =====================================================

  useEffect(() => {

    if (
      lockoutSeconds <= 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {

        setLockoutSeconds(
          (prev) =>
            prev > 1
              ? prev - 1
              : 0
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [lockoutSeconds]);

  // =====================================================
  // LIMPIAR ERROR
  // =====================================================

  useEffect(() => {

    if (
      lockoutSeconds === 0
    ) {

      setError("");
    }

  }, [lockoutSeconds]);

  // =====================================================
  // GOOGLE
  // =====================================================

  const loginGoogle = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      console.log("🔵 Iniciando Google...");
      // Detect native platform (Capacitor)
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        // Use native Capacitor Firebase Authentication plugin
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        const result = await FirebaseAuthentication.signIn({ provider: 'google.com' });
        if (!result || !result.user) throw new Error('Firebase native sign‑in did not return a user');
        const user = result.user;
        console.log('✅ Google nativo autenticado:', user.uid, user.email);
        // Continue with same Firestore profile logic using the native user object
        const specialistRef = doc(db, "specialists", user.uid);
        const specialistSnap = await getDoc(specialistRef);
        if (specialistSnap.exists()) {
          await setDoc(specialistRef, { ultimoAcceso: serverTimestamp() }, { merge: true });
          navigate("/specialist/dashboard", { replace: true });
          return;
        }
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            nombre: user.displayName || "",
            correo: user.email || "",
            foto: user.photoURL || "",
            proveedor: "Google",
            rol: "usuario",
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            estado: "Activo",
          });
        } else {
          await setDoc(userRef, {
            ultimoAcceso: serverTimestamp(),
            nombre: user.displayName || userSnap.data()?.nombre || "",
            correo: user.email || userSnap.data()?.correo || "",
            foto: user.photoURL || userSnap.data()?.foto || "",
          }, { merge: true });
        }
        navigate("/dashboard", { replace: true });
        return;
      }
      // Fallback to web sign‑in
      const result = await signInWithPopup(auth, googleProvider);
      if (!result || !result.user) throw new Error('Firebase no devolvió un usuario.');
      const user = result.user;
      console.log('✅ Google autenticado:', user.uid, user.email);
      // Existing Firestore handling (same as original)
      const specialistRef = doc(db, "specialists", user.uid);
      const specialistSnap = await getDoc(specialistRef);
      if (specialistSnap.exists()) {
        await setDoc(specialistRef, { ultimoAcceso: serverTimestamp() }, { merge: true });
        navigate("/specialist/dashboard", { replace: true });
        return;
      }
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nombre: user.displayName || "",
          correo: user.email || "",
          foto: user.photoURL || "",
          proveedor: "Google",
          rol: "usuario",
          fechaRegistro: serverTimestamp(),
          ultimoAcceso: serverTimestamp(),
          estado: "Activo",
        });
        console.log('✅ Perfil Google creado');
      } else {
        await setDoc(userRef, {
          ultimoAcceso: serverTimestamp(),
          nombre: user.displayName || userSnap.data()?.nombre || "",
          correo: user.email || userSnap.data()?.correo || "",
          foto: user.photoURL || userSnap.data()?.foto || "",
        }, { merge: true });
        console.log('✅ Perfil Google actualizado');
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error('❌ Error Google:', error);
      console.error('Código:', error?.code);
      console.error('Mensaje:', error?.message);
      switch (error?.code) {
        case 'auth/popup-blocked':
          setError('El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo nuevamente.');
          break;
        case 'auth/popup-closed-by-user':
          setError('Se canceló el inicio de sesión con Google.');
          break;
        case 'auth/cancelled-popup-request':
          setError('Ya existe una ventana de inicio de sesión abierta.');
          break;
        case 'auth/unauthorized-domain':
          setError('Este dominio no está autorizado en Firebase Authentication.');
          break;
        case 'auth/operation-not-supported-in-this-environment':
          setError('Google no está disponible en este entorno. Prueba desde el navegador.');
          break;
        case 'auth/network-request-failed':
          setError('No hay conexión con Firebase. Verifica tu conexión a Internet.');
          break;
        default:
          setError(`No se pudo iniciar sesión con Google. ${error?.code || ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FACEBOOK
  // =====================================================

  const loginFacebook = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      console.log("🔵 Iniciando Facebook...");
      // Detect native platform (Capacitor)
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        // Use native Capacitor Firebase Authentication plugin
        const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
        const result = await FirebaseAuthentication.signIn({ provider: "facebook.com" });
        if (!result || !result.user) throw new Error("Firebase native sign‑in no devolvió un usuario");
        const user = result.user;
        console.log("✅ Facebook nativo autenticado:", user.uid, user.email);
        // Same Firestore profile handling as Google
        const specialistRef = doc(db, "specialists", user.uid);
        const specialistSnap = await getDoc(specialistRef);
        if (specialistSnap.exists()) {
          await setDoc(specialistRef, { ultimoAcceso: serverTimestamp() }, { merge: true });
          navigate("/specialist/dashboard", { replace: true });
          return;
        }
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            nombre: user.displayName || "",
            correo: user.email || "",
            foto: user.photoURL || "",
            proveedor: "Facebook",
            rol: "usuario",
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            estado: "Activo",
          });
        } else {
          await setDoc(
            userRef,
            {
              ultimoAcceso: serverTimestamp(),
              nombre: user.displayName || userSnap.data()?.nombre || "",
              correo: user.email || userSnap.data()?.correo || "",
              foto: user.photoURL || userSnap.data()?.foto || "",
            },
            { merge: true }
          );
        }
        navigate("/dashboard", { replace: true });
        return;
      }
      // Fallback to web sign‑in
      const result = await signInWithPopup(auth, facebookProvider);
      if (!result || !result.user) throw new Error("Firebase no devolvió un usuario");
      const user = result.user;
      console.log("✅ Facebook autenticado:", user.uid, user.email);
      // Same Firestore handling as above
      const specialistRef = doc(db, "specialists", user.uid);
      const specialistSnap = await getDoc(specialistRef);
      if (specialistSnap.exists()) {
        await setDoc(specialistRef, { ultimoAcceso: serverTimestamp() }, { merge: true });
        navigate("/specialist/dashboard", { replace: true });
        return;
      }
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nombre: user.displayName || "",
          correo: user.email || "",
          foto: user.photoURL || "",
          proveedor: "Facebook",
          rol: "usuario",
          fechaRegistro: serverTimestamp(),
          ultimoAcceso: serverTimestamp(),
          estado: "Activo",
        });
      } else {
        await setDoc(
          userRef,
          {
            ultimoAcceso: serverTimestamp(),
            nombre: user.displayName || userSnap.data()?.nombre || "",
            correo: user.email || userSnap.data()?.correo || "",
            foto: user.photoURL || userSnap.data()?.foto || "",
          },
          { merge: true }
        );
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("❌ Error Facebook:", error);
      console.error("Código:", error?.code);
      console.error("Mensaje:", error?.message);
      switch (error?.code) {
        case "auth/popup-blocked":
          setError("El navegador bloqueó la ventana de Facebook. Permite pop‑ups e inténtalo nuevamente.");
          break;
        case "auth/popup-closed-by-user":
          setError("Se canceló el inicio de sesión con Facebook.");
          break;
        case "auth/cancelled-popup-request":
          setError("Ya existe una ventana de inicio de sesión abierta.");
          break;
        case "auth/unauthorized-domain":
          setError("Este dominio no está autorizado en Firebase Authentication.");
          break;
        case "auth/operation-not-supported-in-this-environment":
          setError("Facebook no está disponible en este entorno. Prueba desde el navegador.");
          break;
        case "auth/network-request-failed":
          setError("No hay conexión con Firebase. Verifica tu conexión a Internet.");
          break;
        default:
          setError(`No se pudo iniciar sesión con Facebook. ${error?.code || ""}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CORREO + CONTRASEÑA
  // =====================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      if (
        lockoutSeconds > 0
      ) {

        setError(
          `Demasiados intentos fallidos. Espera ${lockoutSeconds} segundos.`
        );

        return;
      }

      if (loading) {
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

        console.log(
          "✅ Login con correo:",
          user.uid,
          user.email
        );

        setFailedAttempts(0);

        await redirectByRole(
          user,
          navigate,
          setError
        );

      } catch (error) {

        console.error(
          "❌ Error login:",
          error
        );

        console.error(
          "Código:",
          error?.code
        );

        const nuevosIntentos =
          failedAttempts + 1;

        setFailedAttempts(
          nuevosIntentos
        );

        if (
          nuevosIntentos >= 5
        ) {

          setFailedAttempts(0);
          setLockoutSeconds(30);

          setError(
            "Has superado el límite de 5 intentos. Formulario bloqueado por 30 segundos por seguridad."
          );

          return;
        }

        switch (
          error?.code
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

          case "auth/user-disabled":

            setError(
              "Esta cuenta ha sido deshabilitada."
            );

            break;

          case "auth/network-request-failed":

            setError(
              "No hay conexión con Firebase."
            );

            break;

          default:

            setError(
              `No se pudo iniciar sesión. ${error?.code || ""}`
            );
        }

      } finally {

        setLoading(false);
      }
    };

  // =====================================================
  // INTERFAZ
  // =====================================================

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
          onSubmit={handleSubmit}
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
            disabled={
              loading ||
              lockoutSeconds > 0
            }
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
            disabled={
              loading ||
              lockoutSeconds > 0
            }
            required
          />

          <button
            type="submit"
            disabled={
              loading ||
              lockoutSeconds > 0
            }
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
            onClick={loginGoogle}
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
            onClick={loginFacebook}
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