import "../styles/MoodTracker.css";
import MainLayout from "../layouts/MainLayout";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import emotions from "../constants/emotions";
import { crearRegistroEmocional } from "../services/registroEmocionalService";

function MoodTracker() {
  const { user, updateUserProfile } = useApp();

  const [selectedMood, setSelectedMood] = useState(
    user?.currentMood || ""
  );

  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedMood(user?.currentMood || "");
  }, [user?.currentMood]);

  const handleSave = async () => {
    if (!selectedMood) {
      setStatus("Selecciona una emoción antes de guardar.");
      return;
    }

    if (!user?.uid) {
      setStatus("No se encontró el usuario.");
      return;
    }

    const selected = emotions.find(
      (emotion) => emotion.name === selectedMood
    );

    setLoading(true);
    setStatus("Guardando registro...");

    try {
      const ahora = new Date();

      const fecha = ahora.toISOString().split("T")[0];

      const hora = ahora.toLocaleTimeString("es-NI", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const resultado = await crearRegistroEmocional({
        uidUsuario: user.uid,
        emocion: selectedMood,
        intensidad: intensity,
        nota:
          note ||
          `Registré que estoy ${selectedMood.toLowerCase()}`,
        fecha,
        hora,
      });

      if (!resultado.success) {
        setStatus("No se pudo guardar el registro.");
        return;
      }

      const nextNotes = [
        ...(user?.notes || []),
        {
          mood: selectedMood,
          text:
            note ||
            `Registré que estoy ${selectedMood.toLowerCase()}`,
          date: fecha,
          timestamp: ahora.toISOString(),
        },
      ];

      const nextEmotions = [
        ...(user?.emotions || []),
        selected?.emoji || selectedMood,
      ];

      const nextWellbeing = Math.min(
        100,
        (user?.wellbeing || 70) + 2
      );

      const nextStreak = (user?.streak || 0) + 1;

      await updateUserProfile({
        currentMood: selectedMood,
        wellbeing: nextWellbeing,
        streak: nextStreak,
        notes: nextNotes,
        emotions: nextEmotions,
      });

      setStatus("¡Registro guardado correctamente!");
      setNote("");
      setIntensity(5);
    } catch (error) {
      console.error(
        "Error al guardar registro emocional:",
        error
      );

      setStatus(
        "Ocurrió un error al guardar el registro."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mood-page">
        <div className="mood-header">
          <h1>¿Cómo te sientes hoy?</h1>

          <p>
            Registra tu estado emocional para comprender mejor
            tu bienestar y recibir un seguimiento personalizado.
          </p>
        </div>

        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              type="button"
              className={`emotion-card ${
                selectedMood === emotion.name ? "active" : ""
              }`}
              onClick={() =>
                setSelectedMood(emotion.name)
              }
            >
              <span>{emotion.emoji}</span>
              <p>{emotion.name}</p>
            </button>
          ))}
        </div>

        <section className="mood-note">
          <h2>Intensidad de la emoción</h2>

          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) =>
              setIntensity(Number(e.target.value))
            }
          />

          <p>
            Intensidad: <strong>{intensity}/10</strong>
          </p>
        </section>

        <section className="mood-note">
          <h2>Cuéntanos cómo estuvo tu día</h2>

          <textarea
            placeholder="Escribe aquí cómo te sentiste hoy..."
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
          />
        </section>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? "Guardando..."
            : "Registrar emoción"}
        </button>

        {status && (
          <p className="mood-status">
            {status}
          </p>
        )}
      </div>
    </MainLayout>
  );
}

export default MoodTracker;