import "../styles/Goals.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { FaTrophy, FaFire, FaStar, FaCheckCircle, FaLock } from "react-icons/fa";
import { useState, useEffect } from "react";

const DEFAULT_GOALS = [
  {
    id: "g1",
    title: "Registrar emociones diarias",
    progress: 0,
    total: 7,
    color: "linear-gradient(135deg, #A855F7, #7B61FF)",
  },
  {
    id: "g2",
    title: "Completar pausas de respiración",
    progress: 0,
    total: 5,
    color: "linear-gradient(135deg, #3B82F6, #2563EB)",
  },
  {
    id: "g3",
    title: "Diario de gratitud y notas",
    progress: 0,
    total: 3,
    color: "linear-gradient(135deg, #10B981, #059669)",
  },
];

function Goals() {
  const { user, updateUserProfile, language } = useApp();

  const [goals, setGoals] = useState(() => {
    try {
      const stored = localStorage.getItem("user_goals_progress");
      return stored ? JSON.parse(stored) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const streak = user?.streak || 0;
  const emotionsCount = user?.emotions?.length || 0;
  const notesCount = user?.notes?.length || 0;
  const wellbeing = user?.wellbeing || 72;

  // Actualizar automáticamente progreso con base en datos reales
  useEffect(() => {
    setGoals((current) =>
      current.map((g) => {
        if (g.id === "g1") {
          return { ...g, progress: Math.min(g.total, Math.max(g.progress, streak)) };
        }
        if (g.id === "g3") {
          return { ...g, progress: Math.min(g.total, Math.max(g.progress, notesCount)) };
        }
        return g;
      })
    );
  }, [streak, notesCount]);

  // Nivel de usuario dinámico
  const getUserLevel = () => {
    if (streak >= 14 || emotionsCount >= 20) return "Maestro del Bienestar 👑";
    if (streak >= 7 || emotionsCount >= 10) return "Guardián de la Calma 🛡️";
    if (streak >= 3 || emotionsCount >= 3) return "Explorador Emocional 🧭";
    return "Iniciador del Autocuidado 🌱";
  };

  // Insignias dinámicas
  const badges = [
    {
      icon: "🌟",
      text: language === "es" ? "Primera Emoción" : "First Emotion",
      unlocked: emotionsCount >= 1,
      hint: "Registra tu primer estado de ánimo",
    },
    {
      icon: "🔥",
      text: language === "es" ? "3 Días Seguidos" : "3-Day Streak",
      unlocked: streak >= 3,
      hint: "Mantén una racha de 3 días",
    },
    {
      icon: "💜",
      text: language === "es" ? "Semana Saludable" : "Healthy Week",
      unlocked: wellbeing >= 70,
      hint: "Alcanza más del 70% de bienestar",
    },
    {
      icon: "📝",
      text: language === "es" ? "Mente Consciente" : "Mindful Notes",
      unlocked: notesCount >= 2,
      hint: "Registra 2 o más reflexiones personales",
    },
  ];

  const handleAdvance = (index) => {
    const updated = goals.map((goal, idx) => {
      if (idx !== index) return goal;
      const progress = Math.min(goal.total, goal.progress + 1);
      return { ...goal, progress };
    });

    setGoals(updated);
    try {
      localStorage.setItem("user_goals_progress", JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (updateUserProfile) {
      updateUserProfile({ goals: updated });
    }
  };

  return (
    <MainLayout>
      <div className="goals-container">
        {/* ENCABEZADO */}
        <div className="goals-header">
          <h1 className="page-title">
            🎯 {language === "es" ? "Objetivos y Logros en Tiempo Real" : "Real-Time Goals & Achievements"}
          </h1>
          <p>
            {language === "es"
              ? "Tus avances se actualizan automáticamente conforme registras emociones, notas y hábitos."
              : "Your progress updates automatically as you log emotions, notes, and habits."}
          </p>
        </div>

        {/* TARJETAS SUPERIORES */}
        <div className="goals-top-grid">
          <div className="goal-top-card card-orange">
            <div className="goal-icon-wrapper">
              <FaFire className="goal-top-icon" />
            </div>
            <div className="goal-top-content">
              <h2>{language === "es" ? "Racha Actual" : "Current Streak"}</h2>
              <h3>{streak} {language === "es" ? (streak === 1 ? "día" : "días") : (streak === 1 ? "day" : "days")}</h3>
              <p>
                {streak > 0
                  ? language === "es"
                    ? "¡Excelente consistencia! Sigue registrando diariamente."
                    : "Great consistency! Keep logging every day."
                  : language === "es"
                  ? "Registra tu emoción de hoy para iniciar tu racha."
                  : "Log your mood today to start your streak."}
              </p>
            </div>
          </div>

          <div className="goal-top-card card-purple">
            <div className="goal-icon-wrapper">
              <FaTrophy className="goal-top-icon" />
            </div>
            <div className="goal-top-content">
              <h2>{language === "es" ? "Nivel de Bienestar" : "Wellbeing Level"}</h2>
              <h3>{getUserLevel()}</h3>
              <p>
                {language === "es"
                  ? "Desbloquea insignias cumpliendo tus metas semanales."
                  : "Unlock badges by completing your weekly goals."}
              </p>
            </div>
          </div>
        </div>

        {/* OBJETIVOS SEMANALES */}
        <div className="progress-section">
          <h2 className="section-title">
            {language === "es" ? "Objetivos Semanales Activos" : "Active Weekly Goals"}
          </h2>

          <div className="progress-list">
            {goals.map((goal, index) => {
              const percent = Math.min(100, Math.round((goal.progress / goal.total) * 100));
              const isCompleted = goal.progress >= goal.total;

              return (
                <div
                  className={`progress-card ${isCompleted ? "completed" : ""}`}
                  key={goal.id || index}
                >
                  <div className="progress-info">
                    <div className="progress-title">
                      <strong>{goal.title}</strong>
                      <span>
                        {goal.progress} / {goal.total} ({percent}%)
                      </span>
                    </div>

                    <div className="progress-bar-bg">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percent}%`,
                          background: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="goal-action-btn"
                    onClick={() => handleAdvance(index)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <FaCheckCircle /> {language === "es" ? "¡Completado!" : "Completed!"}
                      </>
                    ) : (
                      language === "es" ? "Registrar avance" : "Log progress"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* INSIGNIAS (LOGROS) */}
        <div className="badges-section">
          <h2 className="section-title">
            <FaStar className="star-icon" /> {language === "es" ? "Mis Insignias y Logros" : "My Badges & Achievements"}
          </h2>

          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div
                className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}
                key={index}
                title={badge.hint}
              >
                <div className="badge-icon-bg">
                  <span className="badge-emoji">{badge.icon}</span>
                  {!badge.unlocked && <FaLock className="badge-lock-overlay" />}
                </div>
                <span className="badge-text">{badge.text}</span>
                <span className="badge-status-tag">
                  {badge.unlocked
                    ? language === "es"
                      ? "Desbloqueado ✓"
                      : "Unlocked ✓"
                    : language === "es"
                    ? "Bloqueado"
                    : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Goals;