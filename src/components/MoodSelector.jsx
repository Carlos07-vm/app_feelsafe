import "../styles/MoodSelector.css";
import { useNavigate } from "react-router-dom";

function MoodSelector() {
  const navigate = useNavigate();
  const moods = [
    {
      emoji: "😀",
      label: "Muy feliz",
    },
    {
      emoji: "😄",
      label: "Feliz",
    },
    {
      emoji: "🙂",
      label: "Tranquilo",
    },
    {
      emoji: "😐",
      label: "Neutral",
    },
    {
      emoji: "😔",
      label: "Triste",
    },
    {
      emoji: "😢",
      label: "Muy triste",
    },
    {
      emoji: "😴",
      label: "Cansado",
    },
  ];

  return (
    <section className="mood-selector">

      <div className="mood-header">

        <h2>¿Cómo te sientes hoy?</h2>

        <p>
          Selecciona la emoción que mejor describa tu estado actual.
        </p>

      </div>

      <div className="mood-grid">

        {moods.map((mood) => (
          <button
            key={mood.label}
            className="mood-card"
            type="button"
            onClick={() => navigate("/mood")}
          >
            <span className="mood-emoji">
              {mood.emoji}
            </span>

            <span className="mood-label">
              {mood.label}
            </span>
          </button>
        ))}

      </div>

    </section>
  );
}

export default MoodSelector;