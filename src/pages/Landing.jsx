import "../styles/Landing.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import hero from "../assets/hero.png";

import {
  FaBrain,
  FaChartLine,
  FaHeartbeat,
  FaRobot,
} from "react-icons/fa";

function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <img src={logo} alt="Logo FeelSafe" className="logo-image" />
          <div>
            <span>FeelSafe</span>
            <p>Tu apoyo al cuidado emocional</p>
          </div>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="nav-btn secondary-btn">
            Iniciar sesión
          </Link>
          <Link to="/register" className="nav-btn primary-btn">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Bienestar digital para tu mente</span>
          <h1>Conecta con tus emociones y cuida tu salud mental de forma sencilla.</h1>
          <p>
            FeelSafe combina seguimiento emocional, apoyo preventivo e inteligencia
            artificial para que te sientas acompañado en cada paso.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Empieza ahora
            </Link>
            <Link to="/resources" className="secondary-btn">
              Ver recursos
            </Link>
          </div>

          <div className="hero-badges">
            <div>
              <strong>+12</strong>
              sesiones guiadas
            </div>
            <div>
              <strong>4</strong>
              herramientas de cuidado
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <img src={hero} alt="Bienestar emocional" className="hero-img" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="landing-feature">
          <FaHeartbeat className="feature-icon" />
          <h3>Registro emocional</h3>
          <p>
            Lleva un registro de tu estado de ánimo y descubre tendencias con
            acompañamiento visual.
          </p>
        </div>

        <div className="landing-feature">
          <FaBrain className="feature-icon" />
          <h3>Análisis personalizado</h3>
          <p>
            Recibe insights automáticos para comprender tus emociones y mejorar
            tu bienestar.
          </p>
        </div>

        <div className="landing-feature">
          <FaRobot className="feature-icon" />
          <h3>Asistente emocional</h3>
          <p>
            Consulta ideas de autocuidado y ejercicios de relajación en segundos.
          </p>
        </div>

        <div className="landing-feature">
          <FaChartLine className="feature-icon" />
          <h3>Progreso claro</h3>
          <p>
            Visualiza tu avance con gráficos y recibe recomendaciones basadas en
            tu actividad.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Landing;

