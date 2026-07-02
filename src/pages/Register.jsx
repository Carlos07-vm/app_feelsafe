import "../styles/Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
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
      setError("Ingresa un correo para recibir el código.");
      return;
    }

    setError("");

    try {
      const code = generateCode();
      await saveCodeByEmail(email, code);
      setCodeSent(true);
      setInfoMessage(`Código enviado al correo. Tu código es: ${code}`);
    } catch (err) {
      setError("No se pudo enviar el código. Intenta nuevamente.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!verificationCode) {
      setError("Ingresa el código que recibiste por correo.");
      setLoading(false);
      return;
    }

    try {
      const isValid = await verifyCodeByEmail(email, verificationCode);

      if (!isValid) {
        setError("Código de verificación incorrecto.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      alert("Cuenta creada y verificada. Bienvenido a FeelSafe 💜");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">💜</div>

        <h1>Crear Cuenta</h1>

        <p>Comienza tu camino hacia una mejor salud emocional.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="button" onClick={handleSendCode}>
            Enviar código al correo
          </button>

          {codeSent && (
            <p style={{ color: "green", fontSize: "0.95rem" }}>
              {infoMessage}
            </p>
          )}

          <input
            type="text"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
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
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p className="auth-link">
          ¿Ya tienes cuenta?
          <Link to="/login"> Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;