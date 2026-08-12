import "../styles/Reports.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
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

const getTrafficStatus = (wellbeing) => {
  if (wellbeing >= 80) return "🟢 Estable";
  if (wellbeing >= 55) return "🟡 Atento";
  return "🔴 Necesita apoyo";
};

function Reports() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">Cargando tus reportes...</p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="report-empty">
          <h2>Debes iniciar sesión para ver tus reportes</h2>
        </div>
      </MainLayout>
    );
  }

  const notes = user.notes || [];
  const trendData = buildWeekTrend(notes);
  const wellbeing = user.wellbeing ?? 0;
  const currentMood = user.currentMood || "Neutral";
  const trafficLabel = getTrafficStatus(wellbeing);

  return (
    <MainLayout>
      <h1 className="page-title">📊 Reportes Emocionales</h1>

      <div className="report-cards">
        <div className="report-card">
          <h3>Bienestar General</h3>
          <h2>{wellbeing}%</h2>
        </div>

        <div className="report-card">
          <h3>Estado Actual</h3>
          <h2>{currentMood}</h2>
        </div>

        <div className="report-card success">
          <h3>Semáforo</h3>
          <h2>{trafficLabel}</h2>
        </div>
      </div>

      <div className="chart-card">
        <h2>Evolución Semanal</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#7B61FF" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MainLayout>
  );
}

export default Reports;
