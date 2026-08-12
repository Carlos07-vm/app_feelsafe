import "../styles/Resources.css";
import MainLayout from "../layouts/MainLayout";
import {
  FaSpa,
  FaMusic,
  FaQuoteLeft,
  FaHeartbeat,
} from "react-icons/fa";
import { useState } from "react";
import MeditationModal from "../components/MeditationModal";

const motivationalQuotes = [
  "Cada pequeño paso es un avance hacia tu bienestar.",
  "Respira profundo y recuerda que tú importas.",
  "La calma empieza cuando decides cuidarte.",
  "Hoy es un buen día para ser amable contigo mismo.",
];

function Resources() {
  const [showMeditation, setShowMeditation] = useState(false);
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [infoMessage, setInfoMessage] = useState(
    "Selecciona una herramienta para recibir una guía práctica."
  );
  const [detailTitle, setDetailTitle] = useState("Información de bienestar");

  const handleQuote = () => {
    const nextQuote = motivationalQuotes[
      Math.floor(Math.random() * motivationalQuotes.length)
    ];
    setQuote(nextQuote);
    setInfoMessage("Tu frase de ánimo ha sido renovada.");
    setDetailTitle("Mensaje positivo");
  };

  const handleToolClick = (tool) => {
    switch (tool) {
      case "breathing":
        setDetailTitle("Ejercicio de respiración");
        setInfoMessage(
          "Inhala durante 4 segundos, mantén por 4 y exhala por 4. Repite durante 1-2 minutos para calmar tu ritmo." 
        );
        break;
      case "music":
        setDetailTitle("Música relajante");
        setInfoMessage(
          "Abre una lista de reproducción suave y respira lentamente. La música puede ayudar a bajar el ritmo cardiaco.");
        window.open("https://www.youtube.com/watch?v=2OEL4P1Rz04", "_blank");
        break;
      default:
        setDetailTitle("Herramienta de bienestar");
        setInfoMessage("Encuentra el equilibrio emocional con esta actividad y anota cómo te hace sentir.");
        break;
    }
  };

  const handleChallenge = () => {
    setDetailTitle("Reto del día");
    setInfoMessage(
      "Escribe tres cosas por las que te sientes agradecido y observa cómo cambia tu ánimo."
    );
  };

  return (
    <MainLayout>
      <div className="resources-page">
        <h1 className="page-title">Centro de Bienestar</h1>

        <div className="wellness-grid">
          <div className="wellness-card">
            <FaSpa className="wellness-icon" />
            <h3>Meditación guiada</h3>
            <p>Relaja tu mente y mejora tu concentración con un ejercicio corto.</p>
            <button type="button" onClick={() => setShowMeditation(true)}>
              Comenzar
            </button>
          </div>

          <div className="wellness-card">
            <FaHeartbeat className="wellness-icon" />
            <h3>Respiración consciente</h3>
            <p>Aprende un método simple para calmar tu nerviosismo y reencontrar el foco.</p>
            <button type="button" onClick={() => handleToolClick("breathing")}>
              Practicar
            </button>
          </div>

          <div className="wellness-card">
            <FaMusic className="wellness-icon" />
            <h3>Música relajante</h3>
            <p>Abre una sesión sonora diseñada para tranquilizar tu mente.</p>
            <button type="button" onClick={() => handleToolClick("music")}>
              Escuchar
            </button>
          </div>

          <div className="wellness-card">
            <FaQuoteLeft className="wellness-icon" />
            <h3>Frase motivacional</h3>
            <p className="quote-text">{quote}</p>
            <button type="button" onClick={handleQuote}>
              Renovar
            </button>
          </div>
        </div>

        <div className="resource-panel">
          <div className="resource-info-card">
            <h3>{detailTitle}</h3>
            <p>{infoMessage}</p>
          </div>

          <div className="challenge-card">
            <div>
              <h2>🎯 Reto del día</h2>
              <p>Escribe tres cosas por las que te sientes agradecido hoy.</p>
            </div>
            <button type="button" onClick={handleChallenge}>
              Tomar reto
            </button>
          </div>
        </div>

        {showMeditation && <MeditationModal close={() => setShowMeditation(false)} />}
      </div>
    </MainLayout>
  );
}

export default Resources;
