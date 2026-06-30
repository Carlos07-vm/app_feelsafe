import { Link } from "react-router-dom";
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
          💜 FeelSafe
        </div>

        <div>
          <Link to="/login" className="nav-btn">
            Iniciar Sesión
          </Link>
        </div>

      </nav>

      <section className="landing-hero">

        <div className="hero-text">

          <h1>
            Tu bienestar emocional importa
          </h1>

          <p>
            FeelSafe utiliza inteligencia artificial para ayudarte a comprender
            tus emociones, detectar riesgos tempranos y fortalecer tu salud mental.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Comenzar
            </Link>

            <Link to="/login" className="secondary-btn">
              Explorar
            </Link>

          </div>

        </div>

      </section>

      <section className="features-section">

        <div className="landing-feature">
          <FaHeartbeat />
          <h3>Registro Emocional</h3>
          <p>Monitorea tus emociones diariamente.</p>
        </div>

        <div className="landing-feature">
          <FaBrain />
          <h3>Análisis Inteligente</h3>
          <p>Detecta señales tempranas de riesgo emocional.</p>
        </div>

        <div className="landing-feature">
          <FaRobot />
          <h3>Asistente IA</h3>
          <p>Recibe orientación personalizada.</p>
        </div>

        <div className="landing-feature">
          <FaChartLine />
          <h3>Reportes</h3>
          <p>Visualiza tu evolución emocional.</p>
        </div>

      </section>

    </div>
  );
}

export default Landing;