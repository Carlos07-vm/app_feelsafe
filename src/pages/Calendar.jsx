import "../styles/Calendar.css";
import MainLayout from "../layouts/MainLayout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

function CalendarPage() {
  const { user, updateUserProfile } = useApp();
  const [value, setValue] = useState(new Date());
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("");

  const formattedDate = value.toISOString().split("T")[0];
  const notes = user?.notes || [];
  const selectedNote = notes.find((item) => item.date === formattedDate);

  useEffect(() => {
    setNoteText(selectedNote?.text || "");
  }, [selectedNote]);

  const saveNote = async () => {
    if (!noteText.trim()) {
      setStatus("Escribe una nota antes de guardar.");
      return;
    }

    const existingIndex = notes.findIndex((item) => item.date === formattedDate);
    const updatedNotes = [...notes];

    if (existingIndex >= 0) {
      updatedNotes[existingIndex] = {
        ...updatedNotes[existingIndex],
        text: noteText.trim(),
        timestamp: new Date().toISOString(),
      };
    } else {
      updatedNotes.push({
        date: formattedDate,
        mood: user?.currentMood || "Neutral",
        text: noteText.trim(),
        timestamp: new Date().toISOString(),
      });
    }

    setStatus("Guardando nota...");
    await updateUserProfile({ notes: updatedNotes });
    setStatus("Nota guardada en el calendario.");
  };

  return (
    <MainLayout>
      <h1 className="page-title">📅 Calendario Emocional</h1>

      <div className="calendar-card">
        <Calendar onChange={setValue} value={value} />

        <div className="selected-date-card">
          <h3>Fecha seleccionada</h3>
          <p>{formattedDate}</p>
          <p className="calendar-note">
            {selectedNote
              ? `${selectedNote.mood} — ${selectedNote.text}`
              : "No hay notas para esta fecha. Registra tu estado hoy."}
          </p>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribe una nota para este día..."
            rows={4}
          />
          <button className="save-btn" type="button" onClick={saveNote}>
            Guardar nota
          </button>
          {status && <p className="calendar-status">{status}</p>}
        </div>
      </div>

      <div className="legend">
        <div>🟢 Feliz</div>
        <div>🟡 Neutral</div>
        <div>🟠 Ansioso</div>
        <div>🔴 Triste</div>
      </div>
    </MainLayout>
  );
}

export default CalendarPage;