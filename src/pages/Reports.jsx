import "../styles/Reports.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations"; // <-- IMPORTAMOS EL DICCIONARIO
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const moodScores = {
  "Muy feliz": 95,
  Feliz: 85,
  Tranquilo: 75,
  Neutral: 65,
  Triste: 45,
  "Muy triste": 30,
  Cansado: 55,
};

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const buildWeekTrend = (notes = []) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  const grouped = notes.reduce((acc, note) => {
    if (!note?.date) return acc;
    acc[note.date] = acc[note.date] || [];
    acc[note.date].push(note);
    return acc;
  }, {});

  return days.map((date) => {
    const key = date.toISOString().split("T")[0];
    const dayNotes = grouped[key] || [];
    const averageMood =
      dayNotes.length > 0
        ? Math.round(
            dayNotes.reduce((sum, entry) => sum + (moodScores[entry.mood] ?? 65), 0) /
              dayNotes.length
          )
        : 0;

    return {
      day: dayNames[date.getDay()],
      mood: averageMood,
    };
  });
};

const getTrafficStatus = (wellbeing, lang) => {
  if (wellbeing >= 80) return lang === 'es' ? "🟢 Estable" : "🟢 Stable";
  if (wellbeing >= 55) return lang === 'es' ? "🟡 Atento" : "🟡 Attentive";
  return lang === 'es' ? "🔴 Necesita apoyo" : "🔴 Needs support";
};

function Reports() {
  const { user, loading, language } = useApp(); // <-- EXTRAEMOS EL IDIOMA GLOBAL
  
  // ACTIVAMOS EL DICCIONARIO
  const t = translations[language] || translations.es;

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">{language === 'es' ? "Cargando tus reportes..." : "Loading your reports..."}</p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="report-empty">
          <h2>{language === 'es' ? "Debes iniciar sesión para ver tus reportes" : "You must log in to view your reports"}</h2>
        </div>
      </MainLayout>
    );
  }

  const notes = user.notes || [];
  const trendData = buildWeekTrend(notes);
  const wellbeing = user.wellbeing ?? 0;
  const currentMood = user.currentMood || "Neutral";
  const trafficLabel = getTrafficStatus(wellbeing, language);

  return (
    <MainLayout>
      <h1 className="page-title">📊 {language === 'es' ? "Reportes Emocionales" : "Emotional Reports"}</h1>

      <div className="report-cards">
        <div className="report-card">
          <h3>{language === 'es' ? "Bienestar General" : "General Wellbeing"}</h3>
          <h2>{wellbeing}%</h2>
        </div>

        <div className="report-card">
          <h3>{language === 'es' ? "Estado Actual" : "Current Status"}</h3>
          <h2>{currentMood}</h2>
        </div>

        <div className="report-card success">
          <h3>{language === 'es' ? "Semáforo" : "Traffic Light"}</h3>
          <h2>{trafficLabel}</h2>
        </div>
      </div>

      <div className="chart-card">
        <h2>{language === 'es' ? "Evolución Semanal" : "Weekly Evolution"}</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                color: 'var(--text)',
                borderRadius: '12px' 
              }} 
            />
            <Line type="monotone" dataKey="mood" stroke="var(--primary)" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MainLayout>
  );
}

export default Reports;