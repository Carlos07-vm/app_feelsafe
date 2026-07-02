import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Iniciaste sesión con ${email}`);
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
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Iniciar Sesión</button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta?
          <Link to="/register"> Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
