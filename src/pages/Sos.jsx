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
        setStatus("Abriendo lista de contactos de confianza... si no tienes, pulsa en hablar con alguien.");
        break;
      case "breath":
        setStatus("Inicia una respiración profunda: inhala 4s, mantén 4s, exhala 4s.");
        break;
      case "talk":
        setStatus("Buscar recursos y líneas de apoyo para conversar con alguien de confianza.");
        break;
      default:
        setStatus("Sigue los consejos y cuida tu ritmo.");
        break;
    }
  };

  return (
    <MainLayout>

      <h1 className="page-title">
         🆘  Centro SOS
      </h1>

      <p className="page-description">
        Si estás pasando por un momento difícil, no estás solo.
        FeelSafe está aquí para ayudarte.
    </p>

      <div className="sos-grid">

        <div className="sos-card emergency">

          <FaPhoneAlt className="sos-icon"/>

          <h2>Llamar a un contacto</h2>

          <p>
            Contacta rápidamente a un familiar o persona de confianza.
          </p>

          <button type="button" onClick={() => handleAction("contact")}>Contactar</button>

        </div>

        <div className="sos-card">

          <FaHeart className="sos-icon"/>

          <h2>Respira conmigo</h2>

          <p>
            Inicia un ejercicio guiado para disminuir la ansiedad.
          </p>

          <button type="button" onClick={() => handleAction("breath")}>Comenzar</button>

        </div>

        <div className="sos-card">

          <FaUserFriends className="sos-icon"/>

          <h2>Habla con alguien</h2>

          <p>
            Compartir cómo te sientes puede ayudarte mucho.
          </p>

          <button type="button" onClick={() => handleAction("talk")}>Ver recomendaciones</button>

        </div>

        <div className="sos-card">

          <FaHandsHelping className="sos-icon"/>

          <h2>Consejos rápidos</h2>

          <ul>
            <li>Respira lentamente.</li>
            <li>Bebe agua.</li>
            <li>Sal a caminar.</li>
            <li>Escucha música relajante.</li>
          </ul>

        </div>

      </div>

      <div className="sos-status">
        <p>{status}</p>
      </div>

    </MainLayout>
  );
}

export default SOS;