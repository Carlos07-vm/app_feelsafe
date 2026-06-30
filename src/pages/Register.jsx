import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          💜
        </div>

        <h1>Crear Cuenta</h1>

        <p>
          Comienza tu camino hacia una mejor salud emocional.
        </p>

        <form className="auth-form">

          <input
            type="text"
            placeholder="Nombre completo"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
          />

          <input
            type="password"
            placeholder="Contraseña"
          />

          <button>
            Registrarse
          </button>

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