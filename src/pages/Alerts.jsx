import "../styles/Alerts.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaBrain,
  FaRobot
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Función para calcular las alertas dinámicas basadas en el bienestar real del usuario
const getDynamicAlerts = (wellbeing, lang) => {
  if (wellbeing >= 70) {
    return {
      statusLabel: lang === 'es' ? 'Estable' : 'Stable',
      statusDesc: lang === 'es' ? 'No se detectan riesgos emocionales importantes.' : 'No significant emotional risks detected.',
      statusColor: 'green',
      stressLabel: lang === 'es' ? 'Bajo' : 'Low',
      stressDesc: lang === 'es' ? 'Tus niveles de estrés están controlados.' : 'Your stress levels are under control.',
      stressColor: 'green',
      wellbeingDesc: lang === 'es' ? 'Has mantenido un buen equilibrio emocional esta semana.' : 'You have maintained good emotional balance this week.',
      iaLabel: lang === 'es' ? 'Autocuidado' : 'Self-care',
      iaDesc: lang === 'es' ? 'Intenta dormir al menos 8 horas y realiza una caminata de 20 minutos.' : 'Try to sleep at least 8 hours and take a 20-minute walk.'
    };
  } else if (wellbeing >= 40) {
    return {
      statusLabel: lang === 'es' ? 'Precaución' : 'Caution',
      statusDesc: lang === 'es' ? 'Se observan algunas fluctuaciones emocionales.' : 'Some emotional fluctuations observed.',
      statusColor: 'orange',
      stressLabel: lang === 'es' ? 'Moderado' : 'Moderate',
      stressDesc: lang === 'es' ? 'Se recomienda realizar ejercicios de respiración.' : 'Breathing exercises are recommended.',
      stressColor: 'orange',
      wellbeingDesc: lang === 'es' ? 'Tu bienestar ha estado variando, cuida tu descanso.' : 'Your wellbeing is fluctuating, take care of your rest.',
      iaLabel: lang === 'es' ? 'Pausa Activa' : 'Active Break',
      iaDesc: lang === 'es' ? 'Toma descansos cortos de 5 minutos cada hora para despejar tu mente.' : 'Take short 5-minute breaks every hour to clear your mind.'
    };
  } else {
    return {
      statusLabel: lang === 'es' ? 'Crítico' : 'Critical',
      statusDesc: lang === 'es' ? 'Niveles bajos de bienestar detectados.' : 'Low wellbeing levels detected.',
      statusColor: 'red',
      stressLabel: lang === 'es' ? 'Alto' : 'High',
      stressDesc: lang === 'es' ? 'Considera apoyarte en tus contactos de emergencia.' : 'Consider relying on your emergency contacts.',
      stressColor: 'red',
      wellbeingDesc: lang === 'es' ? 'Es un momento difícil, recuerda que no estás solo.' : 'It is a difficult time, remember you are not alone.',
      iaLabel: lang === 'es' ? 'Apoyo Inmediato' : 'Immediate Support',
      iaDesc: lang === 'es' ? 'Te sugiero hablar conmigo ahora mismo o buscar ayuda profesional.' : 'I suggest talking to me right now or seeking professional help.'
    };
  }
};

function Alerts() {
  const navigate = useNavigate();
  // Extraemos el usuario, el idioma y el modo oscuro del contexto global (Tiempo Real)
  const { user, language, darkMode } = useApp();

  // Obtenemos el bienestar real (si no existe, usamos 72 por defecto)
  const wellbeing = user?.wellbeing ?? 72;
  const alertsData = getDynamicAlerts(wellbeing, language);

  return (
    <MainLayout>
      <div className={`alerts-page ${darkMode ? "theme-dark" : ""}`}>
        
        {/* ENCABEZADO CENTRADO */}
        <div className="alerts-header">
          <h1 className="page-title">🛡️ {language === 'es' ? 'Centro de Alertas' : 'Alerts Center'}</h1>
          <p>{language === 'es' ? 'Monitorea tu bienestar y descubre recomendaciones personalizadas.' : 'Monitor your wellbeing and discover personalized recommendations.'}</p>
        </div>

        {/* GRID DE TARJETAS (2x2) */}
        <div className="alerts-grid">
          
          {/* TARJETA 1: ESTADO GENERAL */}
          <div className="alert-card">
            <div className={`alert-icon-wrapper icon-${alertsData.statusColor}`}>
              <FaCheckCircle className="alert-icon" />
            </div>
            <div className="alert-content">
              <h4>{language === 'es' ? 'ESTADO GENERAL' : 'GENERAL STATUS'}</h4>
              <h3 className={`text-${alertsData.statusColor}`}>{alertsData.statusLabel}</h3>
              <p>{alertsData.statusDesc}</p>
            </div>
          </div>

          {/* TARJETA 2: NIVEL DE ESTRÉS */}
          <div className="alert-card">
            <div className={`alert-icon-wrapper icon-${alertsData.stressColor}`}>
              <FaExclamationTriangle className="alert-icon" />
            </div>
            <div className="alert-content">
              <h4>{language === 'es' ? 'NIVEL DE ESTRÉS' : 'STRESS LEVEL'}</h4>
              <h3 className={`text-${alertsData.stressColor}`}>{alertsData.stressLabel}</h3>
              <p>{alertsData.stressDesc}</p>
            </div>
          </div>

          {/* TARJETA 3: BIENESTAR */}
          <div className="alert-card">
            <div className="alert-icon-wrapper icon-purple">
              <FaHeart className="alert-icon" />
            </div>
            <div className="alert-content">
              <h4>{language === 'es' ? 'BIENESTAR' : 'WELLBEING'}</h4>
              <h3 className="text-purple">{wellbeing}%</h3>
              <p>{alertsData.wellbeingDesc}</p>
            </div>
          </div>

          {/* TARJETA 4: IA RECOMIENDA */}
          <div className="alert-card">
            <div className="alert-icon-wrapper icon-blue">
              <FaBrain className="alert-icon" />
            </div>
            <div className="alert-content">
              <h4>{language === 'es' ? 'IA RECOMIENDA' : 'AI RECOMMENDS'}</h4>
              <h3 className="text-blue">{alertsData.iaLabel}</h3>
              <p>{alertsData.iaDesc}</p>
            </div>
          </div>

        </div>

        {/* BANNER INFERIOR (CTA) */}
        <div className="alerts-cta-banner">
          <div className="cta-content">
            <h2>{language === 'es' ? '¿Sientes que necesitas hablar con alguien?' : 'Do you feel you need to talk to someone?'}</h2>
            <p>{language === 'es' ? 'Nuestra IA está lista para escucharte y apoyarte en este momento sin juzgarte.' : 'Our AI is ready to listen and support you right now without judging.'}</p>
          </div>
          <button 
            className="cta-button" 
            type="button" 
            onClick={() => navigate("/chat")}
          >
            <FaRobot /> {language === 'es' ? 'Hablar con la IA' : 'Talk to AI'}
          </button>
        </div>

      </div>
    </MainLayout>
  );
}

export default Alerts;
