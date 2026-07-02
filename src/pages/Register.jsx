import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Cuenta creada para ${name}`);
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
          />

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

          <button type="submit">Registrarse</button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta?
          <Link to="/login"> Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
