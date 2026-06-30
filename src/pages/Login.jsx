import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
        
        </div>

        <h1>Bienvenido a FeelSafe</h1>

        <p>
          Inicia sesión para continuar cuidando tu bienestar emocional.
        </p>

        <form className="auth-form">

          <input
            type="email"
            placeholder="Correo electrónico"
          />

          <input
            type="password"
            placeholder="Contraseña"
          />

          <button>
            Iniciar Sesión
          </button>

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