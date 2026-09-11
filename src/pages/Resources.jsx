import "../styles/Resources.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
import {
  FaLeaf,
  FaHeartbeat,
  FaMusic,
  FaQuoteLeft,
  FaBullseye,
  FaCopy,
  FaCheck,
  FaLightbulb,
  FaShieldAlt,
  FaMoon,
  FaFeatherAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import MeditationModal from "../components/MeditationModal";
import BreathingModal from "../components/BreathingModal";
import SoundRelaxModal from "../components/SoundRelaxModal";
import ChallengeModal from "../components/ChallengeModal";
import { readUserJson, userStorageKey } from "../utils/storage";
import { localDateKey } from "../utils/date";

const WELLNESS_GUIDES = [
  {
    id: "grounding",
    icon: <FaShieldAlt />,
    title: "Técnica 5-4-3-2-1 (Anti-Ansiedad)",
    subtitle: "Para detener pensamientos abrumadores o ataques de pánico.",
    steps: [
      "👁️ 5 cosas que puedas VER a tu alrededor (colores, formas, objetos).",
      "✋ 4 cosas que puedas TOCAR (la textura de tu ropa, la mesa, tus manos).",
      "👂 3 cosas que puedas ESCUCHAR (el tráfico, el viento, tu respiración).",
      "👃 2 cosas que puedas OLER (café, aire fresco, tu perfume).",
      "👅 1 cosa que puedas SABOREAR (un sorbo de agua, tu boca).",
    ],
  },
  {
    id: "muscle",
    icon: <FaLightbulb />,
    title: "Relajación Muscular Progresiva",
    subtitle: "Libera la tensión acumulada en el cuerpo.",
    steps: [
      "1. Aprieta los puños fuertemente durante 5 segundos y suelta de golpe.",
      "2. Sube los hombros hacia las orejas, mantén 5 segundos y déjalos caer.",
      "3. Tensa el abdomen por 5 segundos y respira hondo al relajar.",
      "4. Aprieta los dedos de los pies y suelta sintiendo el calor fluir.",
    ],
  },
  {
    id: "sleep",
    icon: <FaMoon />,
    title: "Higiene y Calma para Dormir Mejor",
    subtitle: "Prepara tu mente para un descanso reparador.",
    steps: [
      "🌙 Deja las pantallas 30 minutos antes de acostarte.",
      "📖 Haz 5 minutos de respiración 4-7-8 con luz tenue.",
      "📝 Escribe en una libreta las tareas pendientes para sacarlas de tu mente.",
      "🛏️ Mantén la habitación fresca, oscura y ventilada.",
    ],
  },
  {
    id: "journal",
    icon: <FaFeatherAlt />,
    title: "Descarga Emocional (Journaling)",
    subtitle: "Claridad mental en 3 minutos de escritura libre.",
    steps: [
      "1. Escribe exactamente cómo te sientes ahora sin filtrar ni juzgar.",
      "2. Pregúntate: ¿Qué de esto está bajo mi control hoy y qué no?",
      "3. Elige una sola acción pequeña y amable para ti mismo hoy.",
    ],
  },
];

function Resources() {
  const { user, language } = useApp();
  const t = translations[language] || translations.es;

  // Modals state
  const [showMeditation, setShowMeditation] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  // Quotes
  const motivationalQuotes =
    language === "es"
      ? [
          "Cada pequeño paso es un avance significativo hacia tu bienestar y tranquilidad.",
          "Respira profundo: no tienes que resolver todo hoy, solo dar el siguiente paso.",
          "La calma empieza en el momento en que decides tratarte con paciencia y amor.",
          "Hoy es una nueva oportunidad para ser amable contigo y cuidar tu energía.",
          "Tus emociones son válidas. Escúchalas sin juzgarlas y déjalas fluir.",
          "Está bien descansar. No necesitas ser productivo todo el tiempo para ser valioso.",
        ]
      : [
          "Every small step is meaningful progress toward your wellbeing and peace.",
          "Breathe deep: you don't have to figure out everything today, just take the next step.",
          "Calm begins the moment you decide to treat yourself with patience and love.",
          "Today is a new opportunity to be kind to yourself and protect your energy.",
          "Your feelings are valid. Listen to them without judgment and let them flow.",
          "It's okay to rest. You don't need to be productive all the time to be worthy.",
        ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Active wellness guide tab
  const [activeGuideId, setActiveGuideId] = useState("grounding");

  // Challenge completed today state
  const [challengeCompletedToday, setChallengeCompletedToday] = useState(false);

  useEffect(() => {
    try {
       const today = localDateKey();
       const storedValue = readUserJson(user?.uid, "feelsafe_challenges", []);
       const stored = Array.isArray(storedValue) ? storedValue : [];
      const hasToday = stored.some((item) => item.date === today);
      setChallengeCompletedToday(hasToday);
    } catch {
      // Ignore
    }
  }, [user?.uid]);

  const handleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    setCopiedQuote(false);
  };

  const handleCopyQuote = () => {
    const text = motivationalQuotes[quoteIndex];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  const activeGuide =
    WELLNESS_GUIDES.find((g) => g.id === activeGuideId) || WELLNESS_GUIDES[0];

  return (
    <MainLayout>
      <div className="resources-page">
        <div className="resources-header-row">
          <div>
            <h1 className="resources-main-title">{t.resTitle}</h1>
            <p className="resources-subtitle">
              Herramientas interactivas, ejercicios guiados y técnicas de autorregulación emocional diseñadas para ti.
            </p>
          </div>
        </div>

        {/* ===================================================
            GRID SUPERIOR DE 4 TARJETAS INTERACTIVAS
            =================================================== */}
        <div className="resources-grid-top">
          {/* Tarjeta 1: Meditación Guiada */}
          <div className="res-card">
            <div className="res-card-icon">
              <FaLeaf />
            </div>
            <h3>{t.resMeditation}</h3>
            <p>{t.resMeditationDesc}</p>
            <button
              className="res-btn"
              type="button"
              onClick={() => setShowMeditation(true)}
            >
              {t.resStart}
            </button>
          </div>

          {/* Tarjeta 2: Respiración Consciente */}
          <div className="res-card">
            <div className="res-card-icon heartbeat-icon">
              <FaHeartbeat />
            </div>
            <h3>{t.resBreathing}</h3>
            <p>{t.resBreathingDesc}</p>
            <button
              className="res-btn"
              type="button"
              onClick={() => setShowBreathing(true)}
            >
              {t.resPractice}
            </button>
          </div>

          {/* Tarjeta 3: Música y Ambientes Relajantes */}
          <div className="res-card">
            <div className="res-card-icon music-icon">
              <FaMusic />
            </div>
            <h3>{t.resMusic}</h3>
            <p>{t.resMusicDesc}</p>
            <button
              className="res-btn"
              type="button"
              onClick={() => setShowSounds(true)}
            >
              {t.resListen}
            </button>
          </div>

          {/* Tarjeta 4: Frase Motivacional */}
          <div className="res-card quote-card">
            <div className="res-card-icon quote-icon">
              <FaQuoteLeft />
            </div>
            <h3>{t.resQuoteTitle}</h3>
            <p className="quote-text">"{motivationalQuotes[quoteIndex]}"</p>

            <div className="quote-btn-group">
              <button
                className="res-btn quote-renew-btn"
                type="button"
                onClick={handleQuote}
              >
                {t.resRenew}
              </button>
              <button
                className="quote-copy-icon-btn"
                type="button"
                onClick={handleCopyQuote}
                title="Copiar frase"
              >
                {copiedQuote ? <FaCheck color="#10B981" /> : <FaCopy />}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            SECCIÓN INFERIOR: GUÍAS INTERACTIVAS + RETO DEL DÍA
            =================================================== */}
        <div className="resources-grid-bottom">
          {/* Panel Izquierdo: Guías Prácticas Interactivas con Pestañas */}
          <div className="res-info-card">
            <div className="info-card-header">
              <div>
                <h3>Guías Prácticas de Bienestar Emocional</h3>
                <p className="info-card-desc">
                  Técnicas basadas en mindfulness y regulación nerviosa que puedes aplicar en cualquier momento.
                </p>
              </div>
            </div>

            {/* Pestañas de Guías */}
            <div className="wellness-tabs-nav">
              {WELLNESS_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  className={`wellness-tab-pill ${
                    activeGuideId === guide.id ? "active" : ""
                  }`}
                  onClick={() => setActiveGuideId(guide.id)}
                >
                  <span className="tab-pill-icon">{guide.icon}</span>
                  <span className="tab-pill-text">{guide.title.split(" ")[0]} {guide.title.split(" ")[1]}</span>
                </button>
              ))}
            </div>

            {/* Contenido de la Guía Activa */}
            <div className="active-guide-content">
              <div className="active-guide-head">
                <span className="active-guide-badge-icon">{activeGuide.icon}</span>
                <div>
                  <h4>{activeGuide.title}</h4>
                  <p>{activeGuide.subtitle}</p>
                </div>
              </div>

              <div className="guide-steps-container">
                {activeGuide.steps.map((step, idx) => (
                  <div key={idx} className="guide-step-item">
                    <span className="step-bullet">{idx + 1}</span>
                    <span className="step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Derecho: Reto del Día Interactivo */}
          <div className="res-challenge-card">
            <div className="challenge-header">
              <FaBullseye className="challenge-icon" />
              <h3>{t.resChallengeTitle}</h3>
            </div>
            <p>{t.resChallengeDesc}</p>

            {challengeCompletedToday ? (
              <div className="challenge-completed-badge">
                <FaCheckCircle className="check-done-icon" />
                <div>
                  <strong>¡Reto de hoy completado!</strong>
                  <span>Has practicado tu momento de gratitud diario.</span>
                </div>
              </div>
            ) : (
              <div className="challenge-pending-hint">
                <span>⏱️ Toma menos de 2 minutos y fortalece tu bienestar.</span>
              </div>
            )}

            <button
              className="res-btn-challenge"
              type="button"
              onClick={() => setShowChallenge(true)}
            >
              {challengeCompletedToday ? "Ver o actualizar mi reto" : t.resChallengeBtn}
            </button>
          </div>
        </div>

        {/* ===================================================
            MODALES INTERACTIVOS
            =================================================== */}
        {showMeditation && (
          <MeditationModal uid={user?.uid} close={() => setShowMeditation(false)} />
        )}

        {showBreathing && (
          <BreathingModal uid={user?.uid} close={() => setShowBreathing(false)} />
        )}

        {showSounds && (
          <SoundRelaxModal close={() => setShowSounds(false)} />
        )}

        {showChallenge && (
          <ChallengeModal
            uid={user?.uid}
            close={() => setShowChallenge(false)}
            onComplete={() => setChallengeCompletedToday(true)}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default Resources;
