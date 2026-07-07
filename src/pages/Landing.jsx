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

      {/* ================= NAVBAR ================= */}
      <nav className="landing-nav">

        <div className="landing-logo">
          <img
            src={logo}
            alt="Logo FeelSafe"
            className="logo-image"
          />

          <span>FeelSafe</span>
        </div>

        <Link to="/login" className="nav-btn">
          Iniciar sesión
        </Link>

      </nav>

      {/* ================= HERO ================= */}
      <section className="landing-hero">

        <div className="hero-text">

          <h1>
            Tu bienestar emocional comienza aquí.
          </h1>

          <p>
            FeelSafe es una plataforma inteligente diseñada para ayudarte a
            comprender tus emociones, fortalecer tu salud mental y recibir
            acompañamiento preventivo mediante inteligencia artificial,
            análisis emocional y herramientas de bienestar.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Crear cuenta
            </Link>

            <Link to="/login" className="secondary-btn">
              Iniciar sesión
            </Link>

          </div>

        </div>

        <div className="hero-image">

          <img
            src={hero}
            alt="Bienestar emocional"
            className="hero-img"
          />

        </div>

      </section>

      {/* ================= FUNCIONALIDADES ================= */}
      <section className="features-section">

        <div className="landing-feature">

          <FaHeartbeat className="feature-icon" />

          <h3>Registro Emocional</h3>

          <p>
            Lleva un seguimiento diario de tus emociones y conoce cómo evoluciona
            tu bienestar emocional.
          </p>

        </div>

        <div className="landing-feature">

          <FaBrain className="feature-icon" />

          <h3>Análisis Inteligente</h3>

          <p>
            Nuestra inteligencia artificial identifica patrones emocionales para
            ayudarte a prevenir situaciones de riesgo.
          </p>

        </div>

        <div className="landing-feature">

          <FaRobot className="feature-icon" />

          <h3>Asistente IA</h3>

          <p>
            Conversa con un asistente inteligente que puede orientarte y ofrecer
            recomendaciones personalizadas.
          </p>

        </div>

        <div className="landing-feature">

          <FaChartLine className="feature-icon" />

          <h3>Reportes</h3>

          <p>
            Visualiza tu progreso mediante estadísticas y gráficos que muestran
            la evolución de tu estado emocional.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Landing;

