import "../styles/Alerts.css";
import MainLayout from "../layouts/MainLayout";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaBrain,
  FaRobot
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Alerts() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="alerts-container">
        
        {/* ENCABEZADO */}
        <div className="alerts-header">
          <h1 className="page-title">
            🛡️ Centro de Alertas
          </h1>
          <p>Monitorea tu bienestar y descubre recomendaciones personalizadas.</p>
        </div>

        {/* GRID DE TARJETAS */}
        <div className="alerts-grid">
          
          {/* TARJETA 1: ESTADO GENERAL (VERDE) */}
          <div className="alert-card card-green">
            <div className="alert-icon-wrapper">
              <FaCheckCircle className="alert-icon" />
            </div>
            <div className="alert-content">
              <h2>Estado General</h2>
              <h3>Estable</h3>
              <p>No se detectan riesgos emocionales importantes.</p>
            </div>
          </div>

          {/* TARJETA 2: NIVEL DE ESTRÉS (NARANJA/AMARILLO) */}
          <div className="alert-card card-orange">
            <div className="alert-icon-wrapper">
              <FaExclamationTriangle className="alert-icon" />
            </div>
            <div className="alert-content">
              <h2>Nivel de Estrés</h2>
              <h3>Moderado</h3>
              <p>Se recomienda realizar ejercicios de respiración.</p>
            </div>
          </div>

          {/* TARJETA 3: BIENESTAR (MORADO) */}
          <div className="alert-card card-purple">
            <div className="alert-icon-wrapper">
              <FaHeart className="alert-icon" />
            </div>
            <div className="alert-content">
              <h2>Bienestar</h2>
              <h3>86%</h3>
              <p>Has mantenido un buen equilibrio emocional esta semana.</p>
            </div>
          </div>

          {/* TARJETA 4: IA RECOMIENDA (AZUL) */}
          <div className="alert-card card-blue">
            <div className="alert-icon-wrapper">
              <FaBrain className="alert-icon" />
            </div>
            <div className="alert-content">
              <h2>IA Recomienda</h2>
              <h3>Autocuidado</h3>
              <p>Intenta dormir al menos 8 horas y realiza una caminata de 20 minutos.</p>
            </div>
          </div>

        </div>

        {/* BANNER INFERIOR (CTA) */}
        <div className="alerts-cta-banner">
          <div className="cta-content">
            <h2>¿Sientes que necesitas hablar con alguien?</h2>
            <p>Nuestra IA está lista para escucharte y apoyarte en este momento sin juzgarte.</p>
          </div>
          <button 
            className="cta-button" 
            type="button" 
            onClick={() => navigate("/chat")}
          >
            <FaRobot /> Hablar con la IA
          </button>
        </div>

      </div>
    </MainLayout>
  );
}

export default Alerts;