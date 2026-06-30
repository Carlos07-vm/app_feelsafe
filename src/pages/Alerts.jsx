import MainLayout from "../layouts/MainLayout";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaBrain,
} from "react-icons/fa";

function Alerts() {
  return (
    <MainLayout>

      <h1 className="page-title">
        🚨 Centro de Alertas
      </h1>

      <div className="alerts-grid">

        <div className="alert-card success">

          <FaCheckCircle className="alert-icon"/>

          <h2>Estado General</h2>

          <h3>Estable</h3>

          <p>
            No se detectan riesgos emocionales importantes.
          </p>

        </div>

        <div className="alert-card warning">

          <FaExclamationTriangle className="alert-icon"/>

          <h2>Nivel de Estrés</h2>

          <h3>Moderado</h3>

          <p>
            Se recomienda realizar ejercicios de respiración.
          </p>

        </div>

        <div className="alert-card purple">

          <FaHeart className="alert-icon"/>

          <h2>Bienestar</h2>

          <h3>86%</h3>

          <p>
            Has mantenido un buen equilibrio emocional esta semana.
          </p>

        </div>

        <div className="alert-card blue">

          <FaBrain className="alert-icon"/>

          <h2>IA Recomienda</h2>

          <h3>Autocuidado</h3>

          <p>
            Intenta dormir al menos 8 horas y realiza una caminata de 20 minutos.
          </p>

        </div>

      </div>

    </MainLayout>
  );
}

export default Alerts;