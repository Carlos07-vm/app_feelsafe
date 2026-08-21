import "../styles/Landing.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

import {
  FaHeart,
  FaBrain,
  FaChartLine,
  FaLeaf,
  FaLock,
  FaUserShield,
} from "react-icons/fa";

function Landing() {
  return (
    <main className="landing">

      {/* =====================================================
          FORMAS DECORATIVAS DEL FONDO
          No son imágenes. Se crean directamente con CSS.
      ====================================================== */}

      <div className="organic-shape shape-left"></div>
      <div className="organic-shape shape-right"></div>
      <div className="organic-shape shape-small-top"></div>
      <div className="organic-shape shape-small-bottom"></div>


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="landing-header">

        <div className="landing-nav">

          {/* Logo */}
          <Link to="/" className="landing-brand">

            <img
              src={logo}
              alt="Logo FeelSafe"
              className="landing-logo"
            />

            <div className="brand-text">
              <span className="brand-name">
                FeelSafe
              </span>

              <span className="brand-tagline">
                Tu bienestar importa
              </span>
            </div>

          </Link>


          {/* Frase de privacidad */}
          <div className="privacy-message">

            <FaUserShield />

            <span>
              Tus datos siempre protegidos. Tú tienes el control.
            </span>

          </div>


          {/* Login */}
          <Link
            to="/login"
            className="login-nav-btn"
          >
            Iniciar sesión
          </Link>

        </div>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="landing-hero">

        <div className="hero-content">

          <span className="hero-label">
            BIENESTAR EMOCIONAL
          </span>


          <h1>
            Un espacio
            <br />
            para <span>volver a ti.</span>
          </h1>


          <p className="hero-description">
            Registra tus emociones, encuentra claridad
            y cuida de ti, paso a paso.
          </p>


          {/* CTA PRINCIPAL */}

          <Link
            to="/register"
            className="hero-cta"
          >
            <span>Crear cuenta</span>

            <span className="cta-arrow">
              →
            </span>
          </Link>


          {/* =================================================
              FRASE DE CONFIANZA
          ================================================== */}

          <div className="trust-row">

            <div className="trust-item">
              <FaLock />
              <span>Privado</span>
            </div>

            <span className="trust-dot">•</span>

            <div className="trust-item">
              <FaHeart />
              <span>Personal</span>
            </div>

            <span className="trust-dot">•</span>

            <div className="trust-item">
              <FaUserShield />
              <span>Seguro</span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FUNCIONALIDADES
      ====================================================== */}

      <section className="features-section">

        <div className="features-grid">


          {/* ================= CARD 1 ================= */}

          <article className="feature-card">

            <div className="feature-icon">
              <FaHeart />
            </div>

            <div className="feature-dots">
              ••
            </div>

            <h2>
              Registra cómo te sientes
              cada día
            </h2>

            <div className="feature-line"></div>

            <p>
              Reconoce tus emociones y
              entiende mejor lo que estás
              viviendo.
            </p>

          </article>


          {/* ================= CARD 2 ================= */}

          <article className="feature-card feature-card-highlight">

            <div className="feature-icon">
              <FaBrain />
            </div>

            <div className="feature-dots">
              ••
            </div>

            <h2>
              Encuentra apoyo cuando
              lo necesites
            </h2>

            <div className="feature-line"></div>

            <p>
              Recursos y orientación para
              acompañarte en tu bienestar.
            </p>

          </article>


          {/* ================= CARD 3 ================= */}

          <article className="feature-card">

            <div className="feature-icon">
              <FaChartLine />
            </div>

            <div className="feature-dots">
              ••
            </div>

            <h2>
              Observa tu crecimiento
              con claridad
            </h2>

            <div className="feature-line"></div>

            <p>
              Visualiza tu evolución y
              reconoce tus pequeños avances.
            </p>

          </article>


          {/* ================= CARD 4 ================= */}

          <article className="feature-card">

            <div className="feature-icon">
              <FaLeaf />
            </div>

            <div className="feature-dots">
              ••
            </div>

            <h2>
              Cuida tu bienestar
              cada día
            </h2>

            <div className="feature-line"></div>

            <p>
              Encuentra herramientas prácticas
              para cuidar de ti.
            </p>

          </article>

        </div>

      </section>


      {/* =====================================================
          FRASE FINAL
      ====================================================== */}

      <div className="landing-bottom-message">

        <span>
          Un pequeño paso también cuenta.
        </span>

      </div>

    </main>
  );
}

export default Landing;