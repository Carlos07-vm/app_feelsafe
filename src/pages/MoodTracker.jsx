import "../styles/MoodTracker.css";
import MainLayout from "../layouts/MainLayout";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import emotions from "../constants/emotions";

function MoodTracker() {
  const { user, updateUserProfile } = useApp();
  const [selectedMood, setSelectedMood] = useState(user?.currentMood || "");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setSelectedMood(user?.currentMood || "");
  }, [user?.currentMood]);

  const handleSave = async () => {
    if (!selectedMood) {
      setStatus("Selecciona una emoción antes de guardar.");
      return;
    }

    const selected = emotions.find((emotion) => emotion.name === selectedMood);
    const nextNotes = [
      ...(user?.notes || []),
      {
        mood: selectedMood,
        text: note || `Registré que estoy ${selectedMood.toLowerCase()}`,
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
      },
    ];

    const nextEmotions = [...(user?.emotions || []), selected?.emoji || selectedMood];
    const nextWellbeing = Math.min(100, (user?.wellbeing || 70) + 2);
    const nextStreak = (user?.streak || 0) + 1;

    setStatus("Guardando registro...");

    await updateUserProfile({
      currentMood: selectedMood,
      wellbeing: nextWellbeing,
      streak: nextStreak,
      notes: nextNotes,
      emotions: nextEmotions,
    });

    setStatus("¡Registro guardado correctamente!");
    setNote("");
  };

  return (
    <MainLayout>
      <div className="mood-page">
        <div className="mood-header">
          <h1>¿Cómo te sientes hoy?</h1>
          <p>
            Registra tu estado emocional para comprender mejor tu bienestar y
            recibir un seguimiento personalizado.
          </p>
        </div>

        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              type="button"
              className={`emotion-card ${selectedMood === emotion.name ? "active" : ""}`}
              onClick={() => setSelectedMood(emotion.name)}
            >
              <span>{emotion.emoji}</span>
              <p>{emotion.name}</p>
            </button>
          ))}
        </div>

        <section className="mood-note">
          <h2>Cuéntanos cómo estuvo tu día</h2>
          <textarea
            placeholder="Escribe aquí cómo te sentiste hoy..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </section>

        <button className="save-btn" onClick={handleSave}>
          Registrar emoción
        </button>

        {status && <p className="mood-status">{status}</p>}
      </div>
    </MainLayout>
  );
}

export default MoodTracker;
