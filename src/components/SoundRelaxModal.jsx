import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaMusic,
  FaPlay,
  FaPause,
  FaCloudRain,
  FaWater,
  FaWind,
  FaBed,
  FaExternalLinkAlt,
  FaYoutube,
  FaSpotify,
} from "react-icons/fa";
import "../styles/SoundRelaxModal.css";

const AMBIENT_SOUNDS = [
  {
    id: "rain",
    name: "Lluvia Suave",
    icon: <FaCloudRain />,
    type: "rain",
    description: "Sonido continuo de lluvia relajante para calmar la mente y concentrarte.",
  },
  {
    id: "waves",
    name: "Olas del Mar",
    icon: <FaWater />,
    type: "waves",
    description: "Vaivén de olas rítmicas para reducir la tensión y respirar despacio.",
  },
  {
    id: "wind",
    name: "Brisa de Bosque",
    icon: <FaWind />,
    type: "wind",
    description: "Susurro de viento suave entre las hojas para reconectar con la naturaleza.",
  },
  {
    id: "pink",
    name: "Ruido Rosa (Sueño)",
    icon: <FaBed />,
    type: "pink",
    description: "Frecuencia equilibrada ideal para descansar profundo y bloquear ruidos.",
  },
];

const EXTERNAL_PLAYLISTS = [
  {
    title: "Música Relajante para Aliviar la Ansiedad (YouTube)",
    url: "https://www.youtube.com/watch?v=2OEL4P1Rz04",
    platform: "YouTube",
    icon: <FaYoutube color="#FF0000" />,
  },
  {
    title: "Sonidos de Naturaleza y Cuencos Tibetanos (YouTube)",
    url: "https://www.youtube.com/watch?v=1ZYbU8csA6g",
    platform: "YouTube",
    icon: <FaYoutube color="#FF0000" />,
  },
  {
    title: "Música Clásica y Frecuencia 432Hz (Spotify / Web)",
    url: "https://open.spotify.com/genre/wellness",
    platform: "Spotify",
    icon: <FaSpotify color="#1DB954" />,
  },
];

function SoundRelaxModal({ close }) {
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const filterNodeRef = useRef(null);
  const lfoRef = useRef(null);

  // Stop current web audio synthesis
  const stopSynthesis = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
    } catch {
      // Ignore cleanup error
    }
  };

  // Start sound synthesis
  const startSynthesis = (soundType) => {
    stopSynthesis();

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink / Brown / White noise generator
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

      if (soundType === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      } else if (soundType === "waves") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        // LFO for rhythmic waves
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.12; // wave cycle ~8 seconds
        lfoGain.gain.value = 350;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;
      } else if (soundType === "wind") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.18;
        lfoGain.gain.value = 250;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;
      } else {
        // Pink noise
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      }

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start(0);

      noiseSourceRef.current = noise;
      filterNodeRef.current = filter;
      gainNodeRef.current = gainNode;
    } catch (e) {
      console.warn("Audio synthesis not allowed or supported:", e);
    }
  };

  const handleToggleSound = (sound) => {
    if (activeSoundId === sound.id && isPlaying) {
      stopSynthesis();
      setIsPlaying(false);
    } else {
      setActiveSoundId(sound.id);
      setIsPlaying(true);
      startSynthesis(sound.type);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val * 0.4, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopSynthesis();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="sound-modal-overlay" onClick={close}>
      <div className="sound-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="sound-close-btn" onClick={close} type="button">
          <FaTimes />
        </button>

        <div className="sound-modal-header">
          <div className="sound-icon-bubble">
            <FaMusic />
          </div>
          <h2>Espacio de Relajación Sonora</h2>
          <p>Reproduce ambientes sonoros relajantes directamente o explora sesiones guiadas externas.</p>
        </div>

        {/* In-app Ambient Sound Player */}
        <div className="ambient-sounds-section">
          <h3 className="section-mini-title">Ambientes y Sonidos Relajantes</h3>
          <div className="ambient-sounds-grid">
            {AMBIENT_SOUNDS.map((s) => {
              const active = activeSoundId === s.id && isPlaying;
              return (
                <div
                  key={s.id}
                  className={`ambient-card ${active ? "playing" : ""}`}
                  onClick={() => handleToggleSound(s)}
                >
                  <div className="ambient-card-left">
                    <span className="ambient-icon">{s.icon}</span>
                    <div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`ambient-play-btn ${active ? "active" : ""}`}
                    aria-label={active ? "Pausar sonido" : "Reproducir sonido"}
                  >
                    {active ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Volume Slider (shown when sound is active) */}
          {isPlaying && (
            <div className="sound-volume-bar">
              <span>Volumen:</span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-range-input"
              />
              <span>{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        {/* External Curated Playlists */}
        <div className="external-playlists-section">
          <h3 className="section-mini-title">Sesiones Musicales y Listas Recomendadas</h3>
          <div className="playlists-list">
            {EXTERNAL_PLAYLISTS.map((pl, idx) => (
              <a
                key={idx}
                href={pl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="playlist-item-link"
              >
                <div className="playlist-info">
                  <span className="playlist-icon">{pl.icon}</span>
                  <span className="playlist-title">{pl.title}</span>
                </div>
                <span className="playlist-open-tag">
                  Abrir <FaExternalLinkAlt size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoundRelaxModal;

