import "../styles/Calendar.css";
import MainLayout from "../layouts/MainLayout";
import Calendar from "react-calendar";
// Importamos los estilos por defecto de la librería para luego sobreescribirlos
import "react-calendar/dist/Calendar.css"; 
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { FaCalendarAlt, FaEdit, FaSave } from "react-icons/fa";

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
    setStatus(""); // Limpiar estado al cambiar de día
  }, [selectedNote, value]);

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
    setStatus("¡Nota guardada exitosamente!");
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <MainLayout>
      <div className="calendar-page-container">
        
        {/* ENCABEZADO */}
        <div className="calendar-header">
          <h1 className="page-title">
            <FaCalendarAlt className="title-icon" /> Calendario Emocional
          </h1>
          <p>Explora tu historial, identifica patrones y registra cómo te sientes cada día.</p>
        </div>

        {/* LAYOUT A 2 COLUMNAS (PC) / APILADO (MÓVIL) */}
        <div className="calendar-layout-grid">
          
          {/* COLUMNA IZQUIERDA: CALENDARIO Y LEYENDA */}
          <div className="calendar-left-panel">
            <div className="calendar-wrapper">
              <Calendar 
                onChange={setValue} 
                value={value} 
                className="feelsafe-calendar"
              />
            </div>
            
            {/* LEYENDA INTEGRADA DEBAJO DEL CALENDARIO */}
            <div className="calendar-legend">
              <div className="legend-item"><span className="dot dot-happy"></span> Feliz</div>
              <div className="legend-item"><span className="dot dot-neutral"></span> Neutral</div>
              <div className="legend-item"><span className="dot dot-anxious"></span> Ansioso</div>
              <div className="legend-item"><span className="dot dot-sad"></span> Triste</div>
            </div>
          </div>

          {/* COLUMNA DERECHA: EDITOR DE NOTAS */}
          <div className="calendar-right-panel">
            <div className="note-editor-card">
              
              <div className="note-header">
                <h3>{formattedDate}</h3>
                <span className={`mood-badge ${selectedNote ? 'has-note' : 'no-note'}`}>
                  {selectedNote ? selectedNote.mood : "Sin registro"}
                </span>
              </div>

              <div className="note-history">
                {selectedNote ? (
                  <p className="saved-text">"{selectedNote.text}"</p>
                ) : (
                  <p className="empty-text">No hay notas para esta fecha. ¡Registra tu estado hoy!</p>
                )}
              </div>

              <div className="note-input-group">
                <label>
                  <FaEdit /> {selectedNote ? "Actualizar nota" : "Nueva nota"}
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escribe cómo te sientes en este día..."
                  rows={5}
                />
              </div>

              <button className="save-btn" type="button" onClick={saveNote}>
                <FaSave /> Guardar nota
              </button>
              
              {status && (
                <div className={`calendar-status ${status.includes("exitosa") ? "success" : ""}`}>
                  {status}
                </div>
              )}
              
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default CalendarPage;