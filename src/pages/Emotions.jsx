import "../styles/Emotions.css";
import MainLayout from "../layouts/MainLayout";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import emotions from "../constants/emotions";
import { crearRegistroEmocional } from "../services/registroEmocionalService";
import { translations } from "../constants/translations"; 

function Emotions() {
  const { user, updateUserProfile, language, darkMode } = useApp();
  const t = translations[language] || translations.es;

  const [selectedMood, setSelectedMood] = useState(user?.currentMood || "");
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedMood(user?.currentMood || "");
  }, [user?.currentMood]);

  const calculateWellbeingChange = (moodName) => {
    const mood = moodName.toLowerCase();
    if (mood.includes('muy feliz')) return 4;
    if (mood.includes('feliz')) return 2;
    if (mood.includes('triste')) return -2;
    if (mood.includes('ansioso')) return -3;
    if (mood.includes('abrumado')) return -4;
    return 0; 
  };

  const handleSave = async () => {
    if (!selectedMood) {
      setStatus(t.selectEmotionFirst || "Selecciona una emoción antes de guardar.");
      return;
    }

    if (!user?.uid) {
      setStatus(t.userNotFound || "No se encontró el usuario.");
      return;
    }

    const selected = emotions.find((emotion) => emotion.name === selectedMood);
    setLoading(true);
    setStatus(t.savingRecord || "Guardando registro...");

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
        nota: note || `${t.registeredMood || 'Registré que estoy'} ${selectedMood.toLowerCase()}`,
        fecha,
        hora,
      });

      if (!resultado.success) {
        setStatus(t.errorSaving || "No se pudo guardar el registro.");
        return;
      }

      const change = calculateWellbeingChange(selectedMood);
      const nextWellbeing = Math.max(0, Math.min(100, (user?.wellbeing || 72) + change));
      
      let nextStreak = user?.streak || 0;
      const lastDate = user?.lastRecordDate; 

      if (lastDate !== fecha) {
        if (lastDate) {
          const dateUltimo = new Date(lastDate);
          const dateHoy = new Date(fecha);
          const diffTime = dateHoy.getTime() - dateUltimo.getTime();
          const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

          if (diffDays === 1) {
            nextStreak += 1; 
          } else if (diffDays > 1) {
            nextStreak = 1; 
          }
        } else {
          nextStreak = 1; 
        }
      }
      
      // VARIABLES RESTAURADAS
      const nextNotes = [
        ...(user?.notes || []),
        {
          mood: selectedMood,
          text: note || `${t.registeredMood || 'Registré que estoy'} ${selectedMood.toLowerCase()}`,
          date: fecha,
          timestamp: ahora.toISOString(),
        },
      ];

      const nextEmotions = [
        ...(user?.emotions || []),
        selected?.emoji || selectedMood,
      ];

      await updateUserProfile({
        currentMood: selectedMood,
        wellbeing: nextWellbeing,
        streak: nextStreak,
        lastRecordDate: fecha,
        notes: nextNotes,
        emotions: nextEmotions,
      });

      setStatus(t.recordSaved || "¡Registro guardado correctamente!");
      setNote("");
      setIntensity(5);
    } catch (error) {
      console.error("Error al guardar registro emocional:", error);
      setStatus(t.errorSaving || "Ocurrió un error al guardar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={`mood-page ${darkMode ? "theme-dark" : ""}`}>
        <div className="mood-header">
          <h1>{t.howAreYouToday || "¿Cómo te sientes hoy?"}</h1>
          <p>
            {t.moodSubtitle || "Registra tu estado emocional para comprender mejor tu bienestar y recibir un seguimiento personalizado."}
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
              <p>{t[emotion.name.toLowerCase()] || emotion.name}</p>
            </button>
          ))}
        </div>

        <section className="mood-note">
          <h2>{t.emotionIntensity || "Intensidad de la emoción"}</h2>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
          <p>
            {t.intensity || "Intensidad"}: <strong>{intensity}/10</strong>
          </p>
        </section>

        <section className="mood-note">
          <h2>{t.tellUsAboutYourDay || "Cuéntanos cómo estuvo tu día"}</h2>
          <textarea
            placeholder={t.moodPlaceholder || "Escribe aquí cómo te sentiste hoy..."}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </section>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (t.saving || "Guardando...") : (t.saveRecord || "Registrar emoción")}
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

export default Emotions;