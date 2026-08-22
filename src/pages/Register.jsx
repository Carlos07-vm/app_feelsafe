import "../styles/Auth.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";

import { auth, db } from "../services/firebase";
import { register } from "../services/authService";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import logo from "../assets/logo.jpeg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // ==============================
    // VALIDACIONES
    // ==============================

    if (!cleanName) {
      setError("Ingresa tu nombre completo.");
      setLoading(false);
      return;
    }

    if (!cleanEmail) {
      setError("Ingresa tu correo electrónico.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      // ==============================
      // CREAR CUENTA EN FIREBASE AUTH
      // ==============================

      const resultado = await register(
        cleanName,
        cleanEmail,
        password
      );

      if (!resultado.success) {
        setError(resultado.message);
        setLoading(false);
        return;
      }

      const firebaseUser = resultado.user;

      console.log(
        "Usuario creado correctamente:",
        firebaseUser.uid
      );

      // ==============================
      // CREAR PERFIL DEL USUARIO
      // ==============================

      const userRef = doc(
        db,
        "usuarios",
        firebaseUser.uid
      );

      await setDoc(
        userRef,
        {
          uid: firebaseUser.uid,

          nombre: cleanName,

          correo: cleanEmail,

          rol: "usuario",

          tipoCuenta: "usuario",

          estado: "Pendiente",

          fechaRegistro: serverTimestamp(),

          ultimoAcceso: serverTimestamp(),

          foto: "",

          fotoPerfil: "",

          telefono: "",

          fechaNacimiento: "",

          edad: 0,

          genero: "",

          pais: "Nicaragua",

          ciudad: "",

          biografia: "",

          wellbeing: 72,

          streak: 0,

          currentMood: "Neutral",

          notes: [],

          emotions: [],

          nivel: 1,

          puntos: 0,

          esPremium: false,

        },
        {
          merge: true,
        }
      );

      console.log(
        "Perfil de usuario creado correctamente"
      );

      // ==============================
      // ENVIAR VERIFICACIÓN
      // ==============================

      if (auth.currentUser) {
        await sendEmailVerification(
          auth.currentUser
        );
      }

      console.log(
        "Correo de verificación enviado"
      );

      // ==============================
      // IR A VERIFICACIÓN
      // ==============================

      navigate("/verify-email", {
        replace: true,
        state: {
          email: cleanEmail,
          rol: "usuario",
        },
      });

    } catch (err) {
      console.error(
        "ERROR EN REGISTRO:",
        err
      );

      setError(
        err.message ||
        "No se pudo crear la cuenta."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        {/* VOLVER */}

        <Link
          to="/"
          className="back-link"
        >
          ← Volver al inicio
        </Link>

        {/* LOGO */}

        <div className="auth-logo">
          <img
            src={logo}
            alt="Logo FeelSafe"
            className="auth-logo-image"
          />
        </div>

        {/* ENCABEZADO */}

        <div className="register-header">

          <div className="register-icon">
            👤
          </div>

          <h1>
            Crear cuenta
          </h1>

          <p>
            Crea tu espacio personal para
            cuidar tu bienestar emocional.
          </p>

        </div>

        {/* FORMULARIO */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* NOMBRE */}

          <div className="form-group">

            <label htmlFor="name">
              Nombre completo
            </label>

            <input
              id="name"
              type="text"
              placeholder="Ej. Carlos Vásquez"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          {/* CORREO */}

          <div className="form-group">

            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          {/* CONTRASEÑA */}

          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* CONFIRMAR */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* BOTÓN */}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creando cuenta..."
              : "Crear mi cuenta"}
          </button>

        </form>

        {/* ERROR */}

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        {/* REGISTRO ESPECIALISTA */}

        <div className="specialist-register-box">

          <div className="specialist-register-icon">
            🩺
          </div>

          <div className="specialist-register-content">

            <strong>
              ¿Eres profesional de la salud?
            </strong>

            <span>
              Regístrate como especialista
              desde nuestro portal profesional.
            </span>

            <Link
              to="/specialist/register"
              className="specialist-register-link"
            >
              Registro para especialistas →
            </Link>

          </div>

        </div>

        {/* LOGIN */}

        <p className="auth-link">

          ¿Ya tienes una cuenta?

          <Link to="/login">
            {" "}Iniciar sesión
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;