import { useEffect, useState } from "react";
import { FaTimes, FaBullseye, FaCheckCircle, FaHeart, FaStar, FaAward } from "react-icons/fa";
import "../styles/ChallengeModal.css";
import { readUserJson, readUserNumber, userStorageKey } from "../utils/storage";
import { localDateKey } from "../utils/date";

const CHALLENGE_PROMPTS = [
  {
    id: "gratitude",
    title: "Diario de Gratitud Express",
    desc: "Escribe 3 cosas (grandes o pequeñas) por las que te sientas agradecido el día de hoy.",
    placeholders: [
      "1. Algo que me hizo sonreír hoy...",
      "2. Una persona o momento que valoro...",
      "3. Un detalle simple que agradezco...",
    ],
  },
  {
    id: "kindness",
    title: "Gesto de Autocompasión",
    desc: "Escribe 3 palabras amables o un mensaje de aliento que le dirías a un buen amigo si estuviera en tu lugar.",
    placeholders: [
      "1. Reconozco que estoy haciendo mi mejor esfuerzo en...",
      "2. Me perdono por...",
      "3. Hoy me permito descansar y cuidar de...",
    ],
  },
];

function ChallengeModal({ close, onComplete, uid }) {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  const prompt = CHALLENGE_PROMPTS[activePromptIndex];

  useEffect(() => {
    const today = localDateKey();
    const storedValue = readUserJson(uid, "feelsafe_challenges", []);
    const stored = Array.isArray(storedValue) ? storedValue : [];
    const latest = stored.find((entry) => entry.date === today);

    if (latest) {
      const savedPromptIndex = CHALLENGE_PROMPTS.findIndex(
        (item) => item.title === latest.promptTitle
      );
      if (savedPromptIndex >= 0) setActivePromptIndex(savedPromptIndex);
      const savedAnswers = Array.isArray(latest.answers)
        ? latest.answers.slice(0, 3)
        : [];
      setAnswers([
        ...savedAnswers,
        "",
        "",
        "",
      ].slice(0, 3));
    }
  }, [uid]);

  const handleAnswerChange = (index, value) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (error) setError("");
  };

  const handleSaveChallenge = () => {
    const filledCount = answers.filter((a) => a.trim().length > 0).length;
    if (filledCount < 2) {
      setError("Por favor completa al menos 2 de los 3 puntos para finalizar tu reto.");
      return;
    }

    // Save to localStorage
    try {
       const today = localDateKey();
       const stored = readUserJson(uid, "feelsafe_challenges", []);
      const newEntry = {
        date: today,
        promptTitle: prompt.title,
        answers: answers.filter((a) => a.trim().length > 0),
        timestamp: Date.now(),
      };
       const existingToday = stored.some(
         (entry) => entry.date === today && entry.promptTitle === prompt.title
       );
       const updated = [
         newEntry,
         ...stored.filter(
           (entry) => !(entry.date === today && entry.promptTitle === prompt.title)
         ),
       ];
       localStorage.setItem(userStorageKey(uid, "feelsafe_challenges"), JSON.stringify(updated.slice(0, 30)));

       const challengeCount = readUserNumber(uid, "feelsafe_challenge_count") + (existingToday ? 0 : 1);
       localStorage.setItem(userStorageKey(uid, "feelsafe_challenge_count"), String(challengeCount));
      window.dispatchEvent(new Event("feelsafe_goals_updated"));
    } catch {
      // LocalStorage fallback
    }

    setCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="challenge-modal-overlay" onClick={close}>
      <div className="challenge-modal-box" onClick={(e) => e.stopPropagation()}>
         <button className="challenge-close-btn" onClick={close} type="button" aria-label="Cerrar reto">
           <FaTimes aria-hidden="true" />
        </button>

        {!completed ? (
          <>
            <div className="challenge-modal-header">
              <div className="challenge-icon-bubble">
                <FaBullseye />
              </div>
              <h2>Reto de Bienestar del Día</h2>
              <p>Entrena tu mente para enfocarse en lo positivo y fortalecer tu resiliencia emocional.</p>
            </div>

            {/* Prompt Selector */}
            <div className="prompt-selector-tabs">
              {CHALLENGE_PROMPTS.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className={`prompt-tab-btn ${activePromptIndex === idx ? "active" : ""}`}
                  onClick={() => {
                    setActivePromptIndex(idx);
                    setAnswers(["", "", ""]);
                    setError("");
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <div className="prompt-instructions-box">
              <p>{prompt.desc}</p>
            </div>

            {/* Inputs */}
            <div className="challenge-inputs-list">
               {prompt.placeholders.map((ph, index) => (
                 <div key={ph} className="challenge-input-row">
                  <span className="input-number-badge">{index + 1}</span>
                  <input
                    type="text"
                    className="challenge-text-input"
                    placeholder={ph}
                   value={answers[index]}
                   onChange={(e) => handleAnswerChange(index, e.target.value)}
                   maxLength={150}
                   aria-label={ph}
                  />
                </div>
              ))}
            </div>

            {error && <p className="challenge-error-text">{error}</p>}

            <div className="challenge-modal-actions">
              <button
                type="button"
                className="challenge-submit-btn"
                onClick={handleSaveChallenge}
              >
                <FaHeart /> Completar Reto de Hoy
              </button>
            </div>
          </>
        ) : (
          <div className="challenge-success-view">
            <div className="success-badge-icon">
              <FaAward />
            </div>
            <h2>¡Reto Completado con Éxito! 🎉</h2>
            <p>
              Has dado un gran paso cuidando de tu mente hoy. La gratitud y la autocompasión construyen bienestar a largo plazo.
            </p>
            <div className="summary-tags-row">
              <span className="summary-pill"><FaStar /> +10 Puntos de Bienestar</span>
              <span className="summary-pill"><FaCheckCircle /> Reto Diario Guardado</span>
            </div>
            <button
              type="button"
              className="challenge-submit-btn"
              onClick={close}
            >
              Volver al Centro de Bienestar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChallengeModal;

