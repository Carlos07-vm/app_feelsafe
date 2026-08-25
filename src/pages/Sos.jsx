import "../styles/Sos.css";
import MainLayout from "../layouts/MainLayout";
import {
  FaPhoneAlt,
  FaHeart,
  FaUserFriends,
  FaHandsHelping,
} from "react-icons/fa";
import { useState } from "react";

function SOS() {
  const [status, setStatus] = useState("Selecciona una opción para recibir ayuda inmediata.");

  const handleAction = (type) => {
    switch (type) {
      case "contact":
        setStatus("Abriendo lista de contactos de confianza... Si no tienes, pulsa en hablar con alguien.");
        break;
      case "breath":
        setStatus("Inicia una respiración profunda: inhala 4s, mantén 4s, exhala 4s.");
        break;
      case "talk":
        setStatus("Buscando recursos y líneas de apoyo para conversar con alguien de confianza.");
        break;
      default:
        setStatus("Sigue los consejos y cuida tu ritmo.");
        break;
    }
  };

  return (
    <MainLayout>
      <div className="sos-container">

        {/* ENCABEZADO */}
        <div className="sos-header">
          <h1 className="page-title">
            🆘 Centro SOS
          </h1>
          <p className="page-description">
            Si estás pasando por un momento difícil, no estás solo. FeelSafe está aquí para ayudarte.
          </p>
        </div>

        {/* GRID DE TARJETAS */}
        <div className="sos-grid">

          {/* TARJETA 1: EMERGENCIA (Detalles rojos) */}
          <div className="sos-card card-red">
            <div className="sos-icon-wrapper">
              <FaPhoneAlt className="sos-icon" />
            </div>
            <h2>Llamar a un contacto</h2>
            <p className="sos-text">
              Contacta rápidamente a un familiar o persona de confianza.
            </p>
            <button 
              className="sos-btn" 
              type="button" 
              onClick={() => handleAction("contact")}
            >
              Contactar
            </button>
          </div>

          {/* TARJETA 2: RESPIRACIÓN (Detalles azules) */}
          <div className="sos-card card-blue">
            <div className="sos-icon-wrapper">
              <FaHeart className="sos-icon" />
            </div>
            <h2>Respira conmigo</h2>
            <p className="sos-text">
              Inicia un ejercicio guiado para disminuir la ansiedad.
            </p>
            <button 
              className="sos-btn" 
              type="button" 
              onClick={() => handleAction("breath")}
            >
              Comenzar
            </button>
          </div>

          {/* TARJETA 3: HABLAR (Detalles morados) */}
          <div className="sos-card card-purple">
            <div className="sos-icon-wrapper">
              <FaUserFriends className="sos-icon" />
            </div>
            <h2>Habla con alguien</h2>
            <p className="sos-text">
              Compartir cómo te sientes puede ayudarte mucho.
            </p>
            <button 
              className="sos-btn" 
              type="button" 
              onClick={() => handleAction("talk")}
            >
              Ver recomendaciones
            </button>
          </div>

          {/* TARJETA 4: CONSEJOS (Detalles verdes) */}
          <div className="sos-card card-green">
            <div className="sos-icon-wrapper">
              <FaHandsHelping className="sos-icon" />
            </div>
            <h2>Consejos rápidos</h2>
            <ul className="sos-list">
              <li>Respira lentamente.</li>
              <li>Bebe agua.</li>
              <li>Sal a caminar.</li>
              <li>Escucha música relajante.</li>
            </ul>
          </div>

        </div>

        {/* MENSAJE DE ESTADO INFERIOR */}
        <div className="sos-status-banner">
          <p>{status}</p>
        </div>

      </div>
    </MainLayout>
  );
}

export default SOS;