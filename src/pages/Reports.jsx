import "../styles/Reports.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { localDateKey } from "../utils/date";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
  if (wellbeing >= 70) return lang === "es" ? "🟢 Estable" : "🟢 Stable";
  if (wellbeing >= 40) return lang === "es" ? "🟡 Atento" : "🟡 Attentive";
  return lang === "es" ? "🔴 Necesita apoyo" : "🔴 Needs support";
};

// Genera la semana actual fija de Lunes a Domingo
const buildWeekTrend = (records = [], notes = [], lang) => {
  const today = new Date();

  const dayNamesEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const names = lang === "es" ? dayNamesEs : dayNamesEn;

  // 1. Calcular Lunes de esta semana
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  // 2. Generar 7 días
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  // 3. Combinar registros de Firestore y notas locales
  const allEntries = [...records];
  notes.forEach((n) => {
    if (n?.date && !allEntries.some((e) => e.fecha === n.date)) {
      allEntries.push({
        fecha: n.date,
        emocion: n.mood,
        nota: n.text,
      });
    }
  });

  // 4. Agrupar por fecha
  const grouped = allEntries.reduce((acc, entry) => {
    const dateKey = entry.fecha || entry.date;
    if (!dateKey) return acc;
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  // 5. Mapear y calcular promedios
  return days.map((date) => {
    const key = localDateKey(date);
    const dayEntries = grouped[key] || [];

    let averageMood = 0;
    if (dayEntries.length > 0) {
      const sum = dayEntries.reduce((acc, item) => {
        const moodName = (item.emocion || item.mood || "").toLowerCase();
        return acc + (moodScores[moodName] ?? 50);
      }, 0);
      averageMood = Math.round(sum / dayEntries.length);
    }

    return {
      day: names[date.getDay()],
      mood: averageMood,
    };
  });
};

function Reports() {
  const { user, loading, language, darkMode } = useApp();
  const t = translations[language] || translations.es;

  const [firestoreRecords, setFirestoreRecords] = useState([]);

  // Escuchar registros emocionales en tiempo real
  useEffect(() => {
    if (!user?.uid) return;

    const recordsRef = collection(db, "registros_emocionales");
    // Query sin orderBy para evitar requerir índices compuestos
    // Ordenaremos en el cliente
    const recordsQuery = query(
      recordsRef,
      where("uidUsuario", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => docSnap.data());
        // Ordenar en el cliente
        list.sort((a, b) => {
          const dateA = new Date(a.fecha || 0).getTime();
          const dateB = new Date(b.fecha || 0).getTime();
          return dateA - dateB;
        });
        setFirestoreRecords(list);
      },
      (err) => {
        // Error manejado silenciosamente - Firestore puede necesitar índices
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">
          {language === "es"
            ? "Cargando tus reportes en tiempo real..."
            : "Loading your real-time reports..."}
        </p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="report-empty">
          <h2>
            {language === "es"
              ? "Debes iniciar sesión para ver tus reportes"
              : "You must log in to view your reports"}
          </h2>
        </div>
      </MainLayout>
    );
  }

  const notes = user.notes || [];
  const trendData = buildWeekTrend(firestoreRecords, notes, language);
  const wellbeing = user.wellbeing ?? 72;
  const currentMood =
    user.currentMood ||
    (language === "es" ? "Sin registrar hoy" : "Unrecorded today");
  const trafficLabel = getTrafficStatus(wellbeing, language);

  return (
    <MainLayout>
      <div className={`reports-page ${darkMode ? "theme-dark" : ""}`}>
        <div className="reports-header">
          <h1 className="page-title">
            📊 {language === "es" ? "Reportes Emocionales en Vivo" : "Live Emotional Reports"}
          </h1>
          <p>
            {language === "es"
              ? "Tus estadísticas se actualizan en tiempo real conforme interactúas con la aplicación."
              : "Your statistics update in real-time as you interact with the application."}
          </p>
        </div>

        {/* Tarjetas Apiladas */}
        <div className="report-cards-stacked">
          <div className="report-card">
            <h3>{language === "es" ? "Bienestar General" : "General Wellbeing"}</h3>
            <h2>{wellbeing}%</h2>
          </div>

          <div className="report-card">
            <h3>{language === "es" ? "Estado Actual" : "Current Status"}</h3>
            <h2>{currentMood}</h2>
          </div>

          <div className="report-card traffic-card">
            <h3>{language === "es" ? "Semáforo Emocional" : "Emotional Traffic Light"}</h3>
            <h2>{trafficLabel}</h2>
          </div>
        </div>

        {/* Gráfica */}
        <div className="chart-card">
          <h2>{language === "es" ? "Evolución Semanal" : "Weekly Evolution"}</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#3a3a5a" : "#e2e8f0"}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke={darkMode ? "#a09bba" : "#64748b"}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={darkMode ? "#a09bba" : "#64748b"}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#252542" : "#ffffff",
                    borderColor: darkMode
                      ? "rgba(255,255,255,0.1)"
                      : "#e2e8f0",
                    color: darkMode ? "#ffffff" : "#1e293b",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#7c55ff"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#7c55ff",
                    strokeWidth: 2,
                    stroke: darkMode ? "#1a1a2e" : "#ffffff",
                  }}
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
