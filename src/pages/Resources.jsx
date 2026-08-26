import "../styles/Resources.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
import { FaLeaf, FaHeartbeat, FaMusic, FaQuoteLeft, FaBullseye } from "react-icons/fa";
import { useState } from "react";
import MeditationModal from "../components/MeditationModal";

function Resources() {
  const { language } = useApp();
  const t = translations[language] || translations.es;

  const [showMeditation, setShowMeditation] = useState(false);

  const motivationalQuotes = language === 'es' ? [
    "Cada pequeño paso es un avance hacia tu bienestar.",
    "Respira profundo y recuerda que tú importas.",
    "La calma empieza cuando decides cuidarte.",
    "Hoy es un buen día para ser amable contigo mismo."
  ] : [
    "Every small step is progress toward your wellbeing.",
    "Breathe deep and remember that you matter.",
    "Calm begins when you decide to take care of yourself.",
    "Today is a good day to be kind to yourself."
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [infoMessage, setInfoMessage] = useState(t.resInfoDesc);
  const [detailTitle, setDetailTitle] = useState(t.resInfoTitle);

  const handleQuote = () => {
    const nextIndex = (quoteIndex + 1) % motivationalQuotes.length;
    setQuoteIndex(nextIndex);
    setInfoMessage(language === 'es' ? "Tu frase de ánimo ha sido renovada." : "Your motivational quote has been renewed.");
    setDetailTitle(language === 'es' ? "Mensaje positivo" : "Positive Message");
  };

  const handleToolClick = (tool) => {
    switch (tool) {
      case "breathing":
        setDetailTitle(language === 'es' ? "Ejercicio de respiración" : "Breathing Exercise");
        setInfoMessage(
          language === 'es' 
            ? "Inhala durante 4 segundos, mantén por 4 y exhala por 4. Repite durante 1-2 minutos para calmar tu ritmo." 
            : "Inhale for 4 seconds, hold for 4, and exhale for 4. Repeat for 1-2 minutes to calm your pace."
        );
        break;
      case "music":
        setDetailTitle(language === 'es' ? "Música relajante" : "Relaxing Music");
        setInfoMessage(
          language === 'es'
            ? "Abre una lista de reproducción suave y respira lentamente. La música puede ayudar a bajar el ritmo cardiaco."
            : "Open a soft playlist and breathe slowly. Music can help lower your heart rate."
        );
        window.open("https://www.youtube.com/watch?v=2OEL4P1Rz04", "_blank");
        break;
      default:
        setDetailTitle(language === 'es' ? "Herramienta de bienestar" : "Wellness Tool");
        setInfoMessage(language === 'es' ? "Encuentra el equilibrio emocional con esta actividad y anota cómo te hace sentir." : "Find emotional balance with this activity and note how it makes you feel.");
        break;
    }
  };

  const handleChallenge = () => {
    setDetailTitle(t.resChallengeTitle);
    setInfoMessage(t.resChallengeDesc);
  };

  return (
    <MainLayout>
      <div className="resources-page">
        <h1 className="resources-main-title">{t.resTitle}</h1>

        {/* Grid superior de 4 tarjetas */}
        <div className="resources-grid-top">
          
          <div className="res-card">
            <div className="res-card-icon"><FaLeaf /></div>
            <h3>{t.resMeditation}</h3>
            <p>{t.resMeditationDesc}</p>
            <button className="res-btn" type="button" onClick={() => setShowMeditation(true)}>
              {t.resStart}
            </button>
          </div>

          <div className="res-card">
            <div className="res-card-icon"><FaHeartbeat /></div>
            <h3>{t.resBreathing}</h3>
            <p>{t.resBreathingDesc}</p>
            <button className="res-btn" type="button" onClick={() => handleToolClick("breathing")}>
              {t.resPractice}
            </button>
          </div>

          <div className="res-card">
            <div className="res-card-icon"><FaMusic /></div>
            <h3>{t.resMusic}</h3>
            <p>{t.resMusicDesc}</p>
            <button className="res-btn" type="button" onClick={() => handleToolClick("music")}>
              {t.resListen}
            </button>
          </div>

          <div className="res-card">
            <div className="res-card-icon"><FaQuoteLeft /></div>
            <h3>{t.resQuoteTitle}</h3>
            <p className="quote-text">{motivationalQuotes[quoteIndex]}</p>
            <button className="res-btn" type="button" onClick={handleQuote}>
              {t.resRenew}
            </button>
          </div>

        </div>

        {/* Sección Inferior de 2 columnas */}
        <div className="resources-grid-bottom">
          
          <div className="res-info-card">
            <h3>{detailTitle}</h3>
            <p>{infoMessage}</p>
          </div>

          <div className="res-challenge-card">
            <div className="challenge-header">
              <FaBullseye className="challenge-icon" />
              <h3>{t.resChallengeTitle}</h3>
            </div>
            <p>{t.resChallengeDesc}</p>
            <button className="res-btn-challenge" type="button" onClick={handleChallenge}>
              {t.resChallengeBtn}
            </button>
          </div>

        </div>

        {showMeditation && <MeditationModal close={() => setShowMeditation(false)} />}
      </div>
    </MainLayout>
  );
}

export default Resources;