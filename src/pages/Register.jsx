import "../styles/Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";

import { auth } from "../services/firebase";
import { register } from "../services/authService";

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

    if (!cleanName) {
      setError("Ingresa tu nombre completo.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      // Crear cuenta y documento en Firestore
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

      console.log(
        "Usuario creado correctamente:",
        resultado.user.uid
      );

      // Enviar correo de verificación
      await sendEmailVerification(auth.currentUser);

      console.log("Correo de verificación enviado");

      // Ir a la página de verificación
      navigate("/verify-email", {
        state: {
          email: cleanEmail,
        },
      });
    } catch (err) {
      console.error("ERROR EN REGISTRO:", err);

      setError(
        err.message || "No se pudo crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Volver */}
        <Link
          to="/"
          className="back-link"
        >
          ← Volver al inicio
        </Link>

        {/* Logo */}
        <div className="auth-logo">
          <img
            src={logo}
            alt="Logo FeelSafe"
            className="auth-logo-image"
          />
        </div>

        <h1>Crear cuenta</h1>

        <p>
          Comienza tu camino hacia una mejor salud emocional.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Repetir la contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>

        </form>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

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