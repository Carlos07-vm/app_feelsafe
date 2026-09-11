import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlay, FaPause, FaRedo, FaLeaf, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import "../styles/MeditationModal.css";
import { readUserNumber, userStorageKey } from "../utils/storage";

const DURATIONS = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const MEDITATION_GUIDES = [
  "Cierra suavemente los ojos y encuentra una postura cómoda.",
  "Inhala profundo por la nariz... y suelta el aire con calma.",
  "Lleva tu atención al peso de tu cuerpo apoyado sobre la superficie.",
  "Relaja la mandíbula, los hombros y las manos.",
  "Si surgen pensamientos o distracciones, obsérvalos y déjalos pasar como nubes en el cielo.",
  "Siente el ritmo natural de tu respiración, sin juzgarlo ni forzarlo.",
  "Estás en un espacio seguro. Este momento es solo para ti.",
  "Permite que cada exhalación libere un poco más de tensión.",
  "Agradece a tu cuerpo y a tu mente por regalarte esta pausa de bienestar.",
];

function MeditationModal({ close, uid }) {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const audioCtxRef = useRef(null);

  // Background soothing tone via Web Audio API
  const playCalmTone = () => {
    try {
      if (!audioEnabled) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(432, audioCtxRef.current.currentTime); // 432Hz healing/calm frequency

      gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 4);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 4);
    } catch {
      // Audio not supported or blocked, ignore
    }
  };

  useEffect(() => {
    if (!running) return;

    // Trigger initial chime
    playCalmTone();

    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, audioEnabled]);

  // Handle meditation end and guide changes: side effects when seconds updates
  useEffect(() => {
    if (!running) return;

    if (seconds <= 1) {
      setRunning(false);
      try {
        const count = readUserNumber(uid, "feelsafe_meditation_count") + 1;
        localStorage.setItem(userStorageKey(uid, "feelsafe_meditation_count"), String(count));
        window.dispatchEvent(new Event("feelsafe_goals_updated"));
      } catch {}
    } else if (seconds % 15 === 0) {
      // Change guide every 12-15 seconds
      setGuideIndex((g) => (g + 1) % MEDITATION_GUIDES.length);
      playCalmTone();
    }
  }, [seconds, running, audioEnabled]);

  const handleDurationChange = (val) => {
    setSelectedDuration(val);
    setSeconds(val);
    setRunning(false);
    setGuideIndex(0);
  };

  const handleReset = () => {
    setSeconds(selectedDuration);
    setRunning(false);
    setGuideIndex(0);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? "0" : ""}${remainderSecs}`;
  };

  const progressPercent = ((selectedDuration - seconds) / selectedDuration) * 100;

  return (
    <div className="meditation-modal-overlay" onClick={close}>
      <div className="meditation-modal-box" role="dialog" aria-modal="true" aria-labelledby="meditation-modal-title" onClick={(e) => e.stopPropagation()}>
        <button className="meditation-close-btn" onClick={close} type="button" aria-label="Cerrar meditación">
          <FaTimes aria-hidden="true" />
        </button>

        <div className="meditation-header">
          <div className="meditation-icon-bubble">
            <FaLeaf />
          </div>
          <h2 id="meditation-modal-title">Meditación Guiada</h2>
          <p>Tómate un momento de pausa consciente para aquietar el ruido exterior y conectar contigo.</p>
        </div>

        {/* Duration selection */}
        {!running && seconds === selectedDuration && (
          <div className="meditation-duration-row">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`duration-chip ${selectedDuration === d.value ? "active" : ""}`}
                onClick={() => handleDurationChange(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Progress Ring / Timer Display */}
        <div className="meditation-timer-display">
          <svg className="meditation-ring-svg" viewBox="0 0 160 160">
            <circle className="ring-bg" cx="80" cy="80" r="70" />
            <circle
              className="ring-progress"
              cx="80"
              cy="80"
              r="70"
              style={{
                strokeDashoffset: 440 - (440 * progressPercent) / 100,
              }}
            />
          </svg>

          <div className="meditation-timer-center">
            <span className="meditation-time-string">{formatTime(seconds)}</span>
            <span className="meditation-time-label">
              {seconds === 0 ? "Completado" : running ? "En curso..." : "Tiempo restante"}
            </span>
          </div>
        </div>

        {/* Guided prompt */}
        <div className="meditation-prompt-card">
          <p className="meditation-guide-text">
            {seconds === 0
              ? "✨ Sesión finalizada. Tómate unos segundos antes de volver a tus actividades con calma."
              : `"${MEDITATION_GUIDES[guideIndex]}"`}
          </p>
        </div>

        {/* Audio mute toggle */}
        <div className="meditation-audio-toggle">
          <button
            type="button"
            className="audio-pill-btn"
            onClick={() => setAudioEnabled((prev) => !prev)}
            title={audioEnabled ? "Silenciar campanilla" : "Activar campanilla suave"}
          >
            {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            <span>{audioEnabled ? "Campana suave activa (432Hz)" : "Sin sonido"}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="meditation-actions">
          {!running && seconds > 0 && (
            <button className="med-start-btn" type="button" onClick={() => setRunning(true)}>
              <FaPlay /> Iniciar Meditación
            </button>
          )}

          {running && (
            <button className="med-pause-btn" type="button" onClick={() => setRunning(false)}>
              <FaPause /> Pausar
            </button>
          )}

          {seconds === 0 && (
            <button className="med-start-btn" type="button" onClick={handleReset}>
              <FaRedo /> Meditar de nuevo
            </button>
          )}

          {!running && seconds < selectedDuration && seconds > 0 && (
            <button className="med-reset-btn" type="button" onClick={handleReset}>
              <FaRedo /> Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeditationModal;
