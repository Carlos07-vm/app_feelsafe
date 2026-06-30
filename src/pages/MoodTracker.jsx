import Sidebar from "../components/Sidebar"
import { useState } from "react";


const emotions = [
  { emoji: "😊", name: "Feliz" },
  { emoji: "😐", name: "Neutral" },
  { emoji: "😔", name: "Triste" },
  { emoji: "😰", name: "Ansioso" },
  { emoji: "😡", name: "Enojado" },
  { emoji: "😴", name: "Cansado" },
  { emoji: "😭", name: "Abrumado" }
];

function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!selectedMood) {
      alert("Selecciona una emoción");
      return;
    }

    alert(`Emoción guardada: ${selectedMood}`);
  };

  return (
    <div className="mood-page">
      <h1>¿Cómo te sientes hoy?</h1>

      <div className="emotion-grid">
        {emotions.map((emotion) => (
          <div
            key={emotion.name}
            className={`emotion-card ${
              selectedMood === emotion.name ? "active" : ""
            }`}
            onClick={() => setSelectedMood(emotion.name)}
          >
            <span>{emotion.emoji}</span>
            <p>{emotion.name}</p>
          </div>
        ))}
      </div>

      <textarea
        placeholder="Cuéntanos cómo estuvo tu día..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button onClick={handleSave}>
        Guardar Emoción
      </button>
    </div>
  );
}

export default MoodTracker;