import "../styles/Reports.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Mapeo inteligente en minúsculas para evitar errores de tipeo
const moodScores = {
  "muy feliz": 95,
  "feliz": 80,
  "tranquilo": 65,
  "neutral": 50,
  "cansado": 40,
  "ansioso": 30,
  "triste": 25,
  "abrumado": 15,
  "muy triste": 10,
};

const getTrafficStatus = (wellbeing, lang) => {
  if (wellbeing >= 70) return lang === 'es' ? "🟢 Estable" : "🟢 Stable";
  if (wellbeing >= 40) return lang === 'es' ? "🟡 Atento" : "🟡 Attentive";
  return lang === 'es' ? "🔴 Necesita apoyo" : "🔴 Needs support";
};

// Genera la semana actual fija de Lunes a Domingo
const buildWeekTrend = (notes = [], lang) => {
  const today = new Date();
  
  const dayNamesEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const names = lang === 'es' ? dayNamesEs : dayNamesEn;

  // 1. Calcular exactamente qué día fue el Lunes de esta semana
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1; // Ajuste si hoy es domingo
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  // 2. Generar el array de 7 días estrictamente desde ese Lunes hasta el Domingo
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  // 3. Agrupar las notas por fecha
  const grouped = notes.reduce((acc, note) => {
    if (!note?.date) return acc;
    acc[note.date] = acc[note.date] || [];
    acc[note.date].push(note);
    return acc;
  }, {});

  // 4. Mapear y calcular los promedios en orden
  return days.map((date) => {
    const key = date.toISOString().split("T")[0];
    const dayNotes = grouped[key] || [];
    
    let averageMood = 0;
    if (dayNotes.length > 0) {
      const sum = dayNotes.reduce((acc, entry) => {
        const moodName = entry.mood ? entry.mood.toLowerCase() : "";
        return acc + (moodScores[moodName] ?? 50);
      }, 0);
      averageMood = Math.round(sum / dayNotes.length);
    }

    return {
      day: names[date.getDay()], // Extrae el nombre correcto (Ej: "Lun", "Mar")
      mood: averageMood,
    };
  });
};

function Reports() {
  const { user, loading, language, darkMode } = useApp();
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
  const trendData = buildWeekTrend(notes, language);
  const wellbeing = user.wellbeing ?? 72;
  const currentMood = user.currentMood || (language === 'es' ? "Sin registrar" : "Unrecorded");
  const trafficLabel = getTrafficStatus(wellbeing, language);

  return (
    <MainLayout>
      <div className={`reports-page ${darkMode ? "theme-dark" : ""}`}>
        
        <div className="reports-header">
          <h1 className="page-title">📊 {language === 'es' ? "Reportes Emocionales" : "Emotional Reports"}</h1>
        </div>

        {/* Tarjetas Apiladas */}
        <div className="report-cards-stacked">
          <div className="report-card">
            <h3>{language === 'es' ? "Bienestar General" : "General Wellbeing"}</h3>
            <h2>{wellbeing}%</h2>
          </div>

          <div className="report-card">
            <h3>{language === 'es' ? "Estado Actual" : "Current Status"}</h3>
            <h2>{currentMood}</h2>
          </div>

          <div className="report-card traffic-card">
            <h3>{language === 'es' ? "Semáforo" : "Traffic Light"}</h3>
            <h2>{trafficLabel}</h2>
          </div>
        </div>

        {/* Gráfica */}
        <div className="chart-card">
          <h2>{language === 'es' ? "Evolución Semanal" : "Weekly Evolution"}</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#3a3a5a" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="day" stroke={darkMode ? "#a09bba" : "#64748b"} tickLine={false} axisLine={false} />
                <YAxis stroke={darkMode ? "#a09bba" : "#64748b"} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#252542' : '#ffffff', 
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', 
                    color: darkMode ? '#ffffff' : '#1e293b',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#7c55ff" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#7c55ff', strokeWidth: 2, stroke: darkMode ? '#1a1a2e' : '#ffffff' }}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default Reports;