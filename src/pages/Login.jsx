import "../styles/Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Bienvenido a FeelSafe 💜");
      navigate("/dashboard");
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">💜</div>

        <h1>Bienvenido a FeelSafe</h1>

        <p>Inicia sesión para continuar cuidando tu bienestar emocional.</p>

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
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p className="auth-link">
          ¿No tienes cuenta?
          <Link to="/register"> Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;