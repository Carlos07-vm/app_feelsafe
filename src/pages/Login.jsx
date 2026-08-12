import "../styles/Auth.css";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import logo from "../assets/logo.jpeg";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";



// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Iniciar sesión con Google
  const loginGoogle = async () => {
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
         await setDoc(userRef, {
          uid: user.uid,
          nombre: user.displayName,
          correo: user.email,
          foto: user.photoURL,
          proveedor: "Google",
          
    fechaRegistro: serverTimestamp(),
     estado: "Activo",
     });

}




      console.log("Usuario:", result.user);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Se canceló el inicio de sesión.");
          break;

        case "auth/popup-blocked":
          setError("El navegador bloqueó la ventana emergente.");
          break;

        default:
          setError("No se pudo iniciar sesión con Google.");
      }
    }
  };

  // Iniciar sesión con Facebook
  const loginFacebook = async () => {
    setError("");

    try {
      const result = await signInWithPopup(auth, facebookProvider);

      const user = result.user;
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nombre: user.displayName,
          correo: user.email,
          foto: user.photoURL,
          proveedor: "Facebook",
          telefono: "",
          fechaNacimiento: "",
          fechaRegistro: serverTimestamp(),
          estado: "Activo",
        });
      }
      console.log("Usuario:", result.user);


      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Se canceló el inicio de sesión.");
          break;

        case "auth/popup-blocked":
          setError("El navegador bloqueó la ventana emergente.");
          break;

        default:
          setError("No se pudo iniciar sesión con Facebook.");
      }
    }
  };

  // Iniciar sesión con correo
 const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  try {

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;


    const userRef = doc(
      db,
      "usuarios",
      user.uid
    );


    await setDoc(
      userRef,
      {
        ultimoAcceso: serverTimestamp(),
      },
      {
        merge: true,
      }
    );


    console.log(
      "Inicio correcto:",
      user.uid
    );


    navigate("/dashboard");


  } catch (error) {

    console.error(error);

    switch(error.code){

      case "auth/user-not-found":
        setError(
          "No existe una cuenta con ese correo."
        );
        break;


      case "auth/wrong-password":
        setError(
          "La contraseña es incorrecta."
        );
        break;


      case "auth/invalid-email":
        setError(
          "Correo electrónico inválido."
        );
        break;


      case "auth/invalid-credential":
        setError(
          "Correo o contraseña incorrectos."
        );
        break;


      default:
        setError(
          "No se pudo iniciar sesión."
        );

    }

  } finally {

    setLoading(false);

  }
};
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-link">
          ← Volver al inicio
        </Link>

        <div className="auth-logo">
          <img
            src={logo}
            alt="Logo FeelSafe"
            className="auth-logo-image"
          />
        </div>

        <h1>Bienvenido de nuevo</h1>

        <p>
          Inicia sesión para continuar cuidando tu bienestar emocional.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="divider">
            <span>o continuar con</span>
          </div>

          <button
            type="button"
            onClick={loginGoogle}
            className="google-btn"
          >
            <FcGoogle size={22} />
            <span>Continuar con Google</span>
          </button>

          <button
            type="button"
            onClick={loginFacebook}
            className="facebook-btn"
          >
            <FaFacebook size={22} color="#1877F2" />
            <span>Continuar con Facebook</span>
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