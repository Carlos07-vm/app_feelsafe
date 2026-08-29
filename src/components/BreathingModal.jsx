import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlay, FaPause, FaRedo, FaCheck, FaHeartbeat } from "react-icons/fa";
import "../styles/BreathingModal.css";

const TECHNIQUES = [
  {
    id: "box",
    name: "Respiración Cuadrada (4-4-4-4)",
    description: "Ideal para reducir el estrés agudo y recuperar la concentración.",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  {
    id: "478",
    name: "Técnica 4-7-8 (Calma Profunda)",
    description: "Excelente para relajar el sistema nervioso antes de dormir o ante ansiedad.",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  {
    id: "calm",
    name: "Respiración 4-6 (Relajación Rápida)",
    description: "Exhalación prolongada para bajar pulsaciones rápidamente.",
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
  },
];

function BreathingModal({ close }) {
  const [selectedTech, setSelectedTech] = useState(TECHNIQUES[0]);
  const [phase, setPhase] = useState("ready"); // "ready", "inhale", "hold1", "exhale", "hold2", "done"
  const [counter, setCounter] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [totalCycles] = useState(4);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef(null);

  const startExercise = () => {
    setIsActive(true);
    setCycle(1);
    setPhase("inhale");
    setCounter(selectedTech.inhale);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase("ready");
    setCounter(selectedTech.inhale);
    setCycle(1);
  };

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (phase === "inhale") {
          if (selectedTech.hold1 > 0) {
            setPhase("hold1");
            return selectedTech.hold1;
          } else {
            setPhase("exhale");
            return selectedTech.exhale;
          }
        } else if (phase === "hold1") {
          setPhase("exhale");
          return selectedTech.exhale;
        } else if (phase === "exhale") {
          if (selectedTech.hold2 > 0) {
            setPhase("hold2");
            return selectedTech.hold2;
          } else {
            if (cycle >= totalCycles) {
              setPhase("done");
              setIsActive(false);
              return 0;
            } else {
              setCycle((c) => c + 1);
              setPhase("inhale");
              return selectedTech.inhale;
            }
          }
        } else if (phase === "hold2") {
          if (cycle >= totalCycles) {
            setPhase("done");
            setIsActive(false);
            return 0;
          } else {
            setCycle((c) => c + 1);
            setPhase("inhale");
            return selectedTech.inhale;
          }
        }

        return 0;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, cycle, selectedTech, totalCycles]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return "Inhala suavemente por la nariz...";
      case "hold1":
      case "hold2":
        return "Mantén el aire con calma...";
      case "exhale":
        return "Exhala lentamente por la boca...";
      case "done":
        return "¡Excelente trabajo! Has completado la sesión.";
      default:
        return "Prepárate en una posición cómoda.";
    }
  };

  const getCircleClass = () => {
    if (phase === "inhale") return "circle-inhale";
    if (phase === "hold1" || phase === "hold2") return "circle-hold";
    if (phase === "exhale") return "circle-exhale";
    return "circle-ready";
  };

  return (
    <div className="breathing-modal-overlay" onClick={close}>
      <div className="breathing-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="breathing-close-btn" onClick={close} type="button">
          <FaTimes />
        </button>

        <div className="breathing-header">
          <div className="breathing-icon-bubble">
            <FaHeartbeat />
          </div>
          <h2>Respiración Consciente</h2>
          <p>Sigue el ritmo visual del círculo para sincronizar tu respiración y calmar tu mente.</p>
        </div>

        {/* Technique Selector (only when ready) */}
        {!isActive && phase === "ready" && (
          <div className="breathing-tech-selector">
            {TECHNIQUES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tech-pill-btn ${selectedTech.id === t.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedTech(t);
                  setCounter(t.inhale);
                }}
              >
                {t.name}
              </button>
            ))}
            <p className="tech-desc-hint">{selectedTech.description}</p>
          </div>
        )}

        {/* Visual Breathing Circle */}
        <div className="breathing-visual-container">
          <div className={`breathing-circle-outer ${getCircleClass()}`}>
            <div className="breathing-circle-inner">
              {phase === "done" ? (
                <FaCheck className="done-check-icon" />
              ) : (
                <>
                  <span className="breathing-phase-name">
                    {phase === "inhale" && "INHALA"}
                    {(phase === "hold1" || phase === "hold2") && "SOSTÉN"}
                    {phase === "exhale" && "EXHALA"}
                    {phase === "ready" && "LISTO"}
                  </span>
                  <span className="breathing-countdown">{phase === "ready" ? "4s" : `${counter}s`}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Instruction */}
        <p className="breathing-instruction-text">{getPhaseInstruction()}</p>

        {/* Cycle indicator */}
        {phase !== "ready" && phase !== "done" && (
          <div className="breathing-cycles-tag">
            Ciclo {cycle} de {totalCycles}
          </div>
        )}

        {/* Actions */}
        <div className="breathing-actions">
          {phase === "ready" && (
            <button className="breathing-start-btn" type="button" onClick={startExercise}>
              <FaPlay /> Iniciar Ejercicio
            </button>
          )}

          {isActive && (
            <button className="breathing-pause-btn" type="button" onClick={pauseExercise}>
              <FaPause /> Pausar
            </button>
          )}

          {!isActive && phase !== "ready" && phase !== "done" && (
            <>
              <button className="breathing-start-btn" type="button" onClick={() => setIsActive(true)}>
                <FaPlay /> Continuar
              </button>
              <button className="breathing-reset-btn" type="button" onClick={resetExercise}>
                <FaRedo /> Reiniciar
              </button>
            </>
          )}

          {phase === "done" && (
            <button className="breathing-start-btn" type="button" onClick={resetExercise}>
              <FaRedo /> Hacer otra sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BreathingModal;

