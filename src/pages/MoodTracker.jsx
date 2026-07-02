import MainLayout from "../layouts/MainLayout";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import emotions from "../constants/emotions";

function MoodTracker() {
  const { user, setUser } = useApp();
  const [selectedMood, setSelectedMood] = useState(user.currentMood || "");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!selectedMood) {
      alert("Selecciona una emoción");
      return;
    }

    const selected = emotions.find((emotion) => emotion.name === selectedMood);

    setUser({
      ...user,
      currentMood: selectedMood,
      wellbeing: Math.min(100, user.wellbeing + 1),
      streak: user.streak + 1,
      emotions: [...(user.emotions || []), selected?.emoji || selectedMood],
      notes: [
        ...(user.notes || []),
        {
          mood: selectedMood,
          text: note || `Registré que estoy ${selectedMood.toLowerCase()}`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    alert(`Emoción guardada: ${selectedMood}`);
    setNote("");
  };

  return (
    <MainLayout>
      <div className="mood-page">
        <h1>¿Cómo te sientes hoy?</h1>

        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <div
              key={emotion.name}
              className={`emotion-card ${selectedMood === emotion.name ? "active" : ""}`}
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

        <button onClick={handleSave}>Guardar Emoción</button>
      </div>
    </MainLayout>
  );
}

export default MoodTracker;
