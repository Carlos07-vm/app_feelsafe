import "../styles/Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
import logo from "../assets/logo.jpeg";

import {
  generateCode,
  saveCodeByEmail,
  verifyCodeByEmail,
} from "../services/otpService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [codeSent, setCodeSent] = useState(false);

  const navigate = useNavigate();

  const handleSendCode = async () => {

    if (!email) {
      setError("Ingresa un correo electrónico para recibir el código.");
      return;
    }

    setError("");

    try {

      const code = generateCode();

      await saveCodeByEmail(email, code);

      setCodeSent(true);

      setInfoMessage(
        "Se ha generado un código de verificación. (Durante el desarrollo aún no se envía por correo)."
      );

    } catch {

      setError("No se pudo generar el código. Intenta nuevamente.");

    }

  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    setLoading(true);

    setError("");

    if (!verificationCode) {

      setError("Ingresa el código de verificación.");

      setLoading(false);

      return;

    }

    try {

      const isValid = await verifyCodeByEmail(
        email,
        verificationCode
      );

      if (!isValid) {

        setError("Código de verificación incorrecto.");

        setLoading(false);

        return;

      }

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: name,
        }
      );

      navigate("/dashboard");

    } catch (err) {

      setError(err.message || "No se pudo crear la cuenta.");

    }

    setLoading(false);

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

          <button
            type="button"
            onClick={handleSendCode}
          >
            Enviar código
          </button>

          {codeSent && (

            <p className="auth-info">

              {infoMessage}

            </p>

          )}

          <input
            type="text"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(
                e.target.value
              )
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