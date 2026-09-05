import "../styles/Calendar.css";
import MainLayout from "../layouts/MainLayout";
import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatLocalDate = (year, month, day) => {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Helper seguro para extraer texto sin riesgo de crash por objetos
const getSafeText = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return value.name || value.text || value.nota || value.emocion || value.mood || fallback;
  }
  return fallback;
};

function CalendarPage() {
  const { user, updateUserProfile, language } = useApp();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(() =>
    formatLocalDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [recordsMap, setRecordsMap] = useState({});

  // 1. Escuchar registros emocionales en tiempo real desde Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const recordsRef = collection(db, "registros_emocionales");
    const recordsQuery = query(
      recordsRef,
      where("uidUsuario", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const map = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.fecha) {
            map[data.fecha] = data;
          }
        });
        setRecordsMap(map);
      },
      (err) => {
        console.error("Error escuchando registros en Calendar:", err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Extraer notas del perfil de manera segura
  const notes = useMemo(() => {
    if (Array.isArray(user?.notes)) {
      return user.notes.filter((item) => item && typeof item === "object");
    }
    return [];
  }, [user?.notes]);

  // 3. Obtener registro o nota de la fecha seleccionada
  const selectedRecord = recordsMap[selectedDate];
  const selectedNote = useMemo(() => {
    if (selectedRecord && typeof selectedRecord === "object") {
      return selectedRecord;
    }
    return notes.find((item) => item?.date === selectedDate) || null;
  }, [selectedRecord, notes, selectedDate]);

  useEffect(() => {
    if (selectedNote) {
      const textVal = getSafeText(selectedNote.nota || selectedNote.text, "");
      setNoteText(textVal);
    } else {
      setNoteText("");
    }
    setStatus("");
  }, [selectedNote, selectedDate]);

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(formatLocalDate(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  // Guardar o actualizar nota
  const saveNote = async () => {
    if (!noteText.trim()) {
      setStatus(
        language === "es"
          ? "Escribe una nota antes de guardar."
          : "Write a note before saving."
      );
      return;
    }

    try {
      setSaving(true);
      const existingIndex = notes.findIndex((item) => item?.date === selectedDate);
      const updatedNotes = [...notes];

      const currentMoodStr = getSafeText(
        selectedRecord?.emocion || user?.currentMood,
        "Neutral"
      );

      const noteEntry = {
        date: selectedDate,
        mood: currentMoodStr,
        text: noteText.trim(),
        nota: noteText.trim(),
        timestamp: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        updatedNotes[existingIndex] = {
          ...updatedNotes[existingIndex],
          ...noteEntry,
        };
      } else {
        updatedNotes.push(noteEntry);
      }

      setStatus(language === "es" ? "Guardando nota..." : "Saving note...");
      if (updateUserProfile) {
        await updateUserProfile({ notes: updatedNotes });
      }

      setStatus(
        language === "es"
          ? "¡Nota guardada exitosamente!"
          : "Note saved successfully!"
      );
      setTimeout(() => setStatus(""), 3500);
    } catch (err) {
      console.error("Error guardando nota en calendario:", err);
      setStatus(
        language === "es"
          ? "Error al guardar la nota."
          : "Error saving note."
      );
    } finally {
      setSaving(false);
    }
  };

  // Generar cuadrícula de días para el mes actual
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const startingBlankDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startingBlankDays; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatLocalDate(currentYear, currentMonth, d);
      const rec = recordsMap[dateStr] || notes.find((n) => n?.date === dateStr);
      let moodType = "";
      if (rec) {
        const rawM = getSafeText(rec.emocion || rec.mood, "").toLowerCase();
        if (rawM.includes("feliz") || rawM.includes("alegre")) moodType = "happy";
        else if (rawM.includes("ansioso") || rawM.includes("abrumado")) moodType = "anxious";
        else if (rawM.includes("triste")) moodType = "sad";
        else moodType = "neutral";
      }

      days.push({
        dayNumber: d,
        dateStr,
        hasRecord: !!rec,
        moodType,
      });
    }
    return days;
  }, [currentYear, currentMonth, recordsMap, notes]);

  const monthLabel =
    language === "es" ? MONTH_NAMES_ES[currentMonth] : MONTH_NAMES_EN[currentMonth];
  const weekdays = language === "es" ? WEEKDAYS_ES : WEEKDAYS_EN;
  const todayStr = formatLocalDate(today.getFullYear(), today.getMonth(), today.getDate());

  const moodLabel = getSafeText(
    selectedNote?.emocion || selectedNote?.mood,
    language === "es" ? "Sin registro" : "No record"
  );

  const displayNote = getSafeText(
    selectedNote?.nota || selectedNote?.text,
    ""
  );

  return (
    <MainLayout>
      <div className="calendar-page-container">
        {/* ENCABEZADO */}
        <div className="calendar-header">
          <h1 className="page-title">
            <FaCalendarAlt className="title-icon" />{" "}
            {language === "es" ? "Calendario Emocional" : "Emotional Calendar"}
          </h1>
          <p>
            {language === "es"
              ? "Explora tu historial día a día. Tus registros emocionales y reflexiones se sincronizan en vivo."
              : "Explore your day-to-day journey. Your emotional records and reflections sync live."}
          </p>
        </div>

        {/* LAYOUT A 2 COLUMNAS */}
        <div className="calendar-layout-grid">
          {/* COLUMNA IZQUIERDA: CALENDARIO */}
          <div className="calendar-left-panel">
            <div className="calendar-wrapper">
              {/* Barra de navegación del mes */}
              <div className="calendar-nav-bar">
                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={handlePrevMonth}
                  title={language === "es" ? "Mes anterior" : "Previous month"}
                >
                  <FaChevronLeft />
                </button>

                <div className="cal-month-title">
                  <h2>{monthLabel} {currentYear}</h2>
                  <button
                    type="button"
                    className="cal-today-pill"
                    onClick={handleToday}
                  >
                    {language === "es" ? "Hoy" : "Today"}
                  </button>
                </div>

                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={handleNextMonth}
                  title={language === "es" ? "Mes siguiente" : "Next month"}
                >
                  <FaChevronRight />
                </button>
              </div>

              {/* Encabezados de días de la semana */}
              <div className="calendar-weekdays-grid">
                {weekdays.map((wd, i) => (
                  <div key={i} className="cal-weekday-header">
                    {wd}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="calendar-days-grid">
                {calendarDays.map((item, idx) => {
                  if (!item) {
                    return <div key={`empty-${idx}`} className="cal-day-cell empty" />;
                  }

                  const isSelected = item.dateStr === selectedDate;
                  const isToday = item.dateStr === todayStr;

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      className={`cal-day-cell ${isSelected ? "selected" : ""} ${
                        isToday ? "today" : ""
                      } ${item.hasRecord ? "has-data" : ""}`}
                      onClick={() => setSelectedDate(item.dateStr)}
                    >
                      <span className="cal-day-num">{item.dayNumber}</span>
                      {item.hasRecord && (
                        <span className={`cal-dot dot-${item.moodType}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEYENDA */}
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="dot dot-happy"></span>{" "}
                {language === "es" ? "Feliz" : "Happy"}
              </div>
              <div className="legend-item">
                <span className="dot dot-neutral"></span>{" "}
                {language === "es" ? "Neutral / Tranquilo" : "Neutral / Calm"}
              </div>
              <div className="legend-item">
                <span className="dot dot-anxious"></span>{" "}
                {language === "es" ? "Ansioso / Abrumado" : "Anxious / Overwhelmed"}
              </div>
              <div className="legend-item">
                <span className="dot dot-sad"></span>{" "}
                {language === "es" ? "Triste" : "Sad"}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: NOTA DEL DÍA */}
          <div className="calendar-right-panel">
            <div className="note-editor-card">
              <div className="note-header">
                <div>
                  <small style={{ color: "#7A6A91", fontWeight: 600 }}>
                    {language === "es" ? "Fecha seleccionada" : "Selected date"}
                  </small>
                  <h3>{selectedDate}</h3>
                </div>
                <span
                  className={`mood-badge ${
                    selectedNote ? "has-note" : "no-note"
                  }`}
                >
                  {moodLabel}
                </span>
              </div>

              <div className="note-history">
                {displayNote ? (
                  <p className="saved-text">
                    "{displayNote}"
                  </p>
                ) : (
                  <p className="empty-text">
                    {language === "es"
                      ? "No hay reflexiones registradas para esta fecha. ¡Escribe cómo te sientes hoy!"
                      : "No reflections logged for this date. Write how you feel today!"}
                  </p>
                )}
              </div>

              <div className="note-input-group">
                <label>
                  <FaEdit />{" "}
                  {selectedNote
                    ? language === "es"
                      ? "Actualizar reflexión"
                      : "Update reflection"
                    : language === "es"
                    ? "Nueva reflexión"
                    : "New reflection"}
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    language === "es"
                      ? "Escribe tus pensamientos o aprendizajes de este día..."
                      : "Write your thoughts or reflections for this day..."
                  }
                  rows={5}
                />
              </div>

              <button
                className="save-btn"
                type="button"
                onClick={saveNote}
                disabled={saving}
              >
                <FaSave />{" "}
                {saving
                  ? language === "es"
                    ? "Guardando..."
                    : "Saving..."
                  : language === "es"
                  ? "Guardar reflexión"
                  : "Save reflection"}
              </button>

              {status && (
                <div
                  className={`calendar-status ${
                    status.includes("exitosa") || status.includes("successfully")
                      ? "success"
                      : ""
                  }`}
                >
                  <FaCheckCircle style={{ marginRight: 6 }} /> {status}
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
