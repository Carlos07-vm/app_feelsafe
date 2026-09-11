import "../styles/Goals.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { FaTrophy, FaFire, FaStar, FaCheckCircle, FaLock, FaBolt } from "react-icons/fa";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { readUserJson, readUserNumber, userStorageKey } from "../utils/storage";

function Goals() {
  const { user, updateUserProfile, language, triggerNotification } = useApp();
  const navigate = useNavigate();

  // Contadores reales desde perfil y localStorage
  const streak = user?.streak || 0;
  const emotionsCount = Array.isArray(user?.emotions) ? user.emotions.length : 0;
  const notesCount = Array.isArray(user?.notes) ? user.notes.length : 0;
  const wellbeing = user?.wellbeing ?? 72;

  const [breathingCount, setBreathingCount] = useState(() => {
    return readUserNumber(user?.uid, "feelsafe_breathing_count");
  });
  const [meditationCount, setMeditationCount] = useState(() => {
    return readUserNumber(user?.uid, "feelsafe_meditation_count");
  });
  const [challengesCount, setChallengesCount] = useState(() => {
    const storedValue = readUserJson(user?.uid, "feelsafe_challenges", []);
    const stored = Array.isArray(storedValue) ? storedValue : [];
    const directCount = readUserNumber(user?.uid, "feelsafe_challenge_count");
    return Math.max(stored.length, directCount);
  });

  // Escuchar eventos de actualización de metas (disparados por modales)
  useEffect(() => {
    const handleSync = () => {
       setBreathingCount(readUserNumber(user?.uid, "feelsafe_breathing_count"));
       setMeditationCount(readUserNumber(user?.uid, "feelsafe_meditation_count"));
       const storedValue = readUserJson(user?.uid, "feelsafe_challenges", []);
       const stored = Array.isArray(storedValue) ? storedValue : [];
       const directCount = readUserNumber(user?.uid, "feelsafe_challenge_count");
       setChallengesCount(Math.max(stored.length, directCount));
    };

    window.addEventListener("feelsafe_goals_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("feelsafe_goals_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [user?.uid]);

  // Objetivos calculados automáticamente según actividad real
  const goals = useMemo(() => [
    {
      id: "g1",
      title: language === "es" ? "Registrar emociones diarias" : "Log daily emotions",
      desc: language === "es" ? "Meta semanal: 7 días de racha activa" : "Weekly goal: 7 active days streak",
      progress: Math.min(7, streak),
      total: 7,
      color: "linear-gradient(135deg, #A855F7, #7B61FF)",
      actionRoute: "/mood",
      actionLabel: language === "es" ? "Ir al Check-in" : "Go to Check-in",
      isAuto: true,
    },
    {
      id: "g2",
      title: language === "es" ? "Completar pausas de respiración" : "Complete breathing breaks",
      desc: language === "es" ? "Realiza ejercicios de respiración consciente" : "Do mindful breathing exercises",
      progress: Math.min(5, breathingCount),
      total: 5,
      color: "linear-gradient(135deg, #3B82F6, #2563EB)",
      actionRoute: "/resources",
      actionLabel: language === "es" ? "Practicar" : "Practice",
      isAuto: true,
    },
    {
      id: "g3",
      title: language === "es" ? "Cumplir retos diarios de bienestar" : "Complete daily wellness challenges",
      desc: language === "es" ? "Escribe tus reflexiones en el reto del día" : "Complete today's challenge reflection",
      progress: Math.min(3, challengesCount),
      total: 3,
      color: "linear-gradient(135deg, #EC4899, #BE185D)",
      actionRoute: "/resources",
      actionLabel: language === "es" ? "Hacer Reto" : "Take Challenge",
      isAuto: true,
    },
    {
      id: "g4",
      title: language === "es" ? "Diario de reflexiones y notas" : "Mindful journal & notes",
      desc: language === "es" ? "Registra notas personales junto a tus emociones" : "Save notes along with your mood check-ins",
      progress: Math.min(3, notesCount),
      total: 3,
      color: "linear-gradient(135deg, #10B981, #059669)",
      actionRoute: "/mood",
      actionLabel: language === "es" ? "Escribir Nota" : "Write Note",
      isAuto: true,
    },
    {
      id: "g5",
      title: language === "es" ? "Sesiones de meditación guiada" : "Guided meditation sessions",
      desc: language === "es" ? "Dedica minutos a meditar con calma" : "Take mindful meditation minutes",
      progress: Math.min(3, meditationCount),
      total: 3,
      color: "linear-gradient(135deg, #F59E0B, #D97706)",
      actionRoute: "/resources",
      actionLabel: language === "es" ? "Meditar" : "Meditate",
      isAuto: true,
    },
  ], [language, streak, breathingCount, challengesCount, notesCount, meditationCount]);

  // Nivel dinámico del usuario
  const getUserLevel = () => {
    if (streak >= 14 || emotionsCount >= 20 || challengesCount >= 10) {
      return language === "es" ? "Maestro del Bienestar 👑" : "Wellness Master 👑";
    }
    if (streak >= 7 || emotionsCount >= 10 || challengesCount >= 5) {
      return language === "es" ? "Guardián de la Calma 🛡️" : "Guardian of Calm 🛡️";
    }
    if (streak >= 3 || emotionsCount >= 3 || challengesCount >= 1) {
      return language === "es" ? "Explorador Emocional 🧭" : "Emotional Explorer 🧭";
    }
    return language === "es" ? "Iniciador del Autocuidado 🌱" : "Self-Care Beginner 🌱";
  };

  // Catálogo completo de Insignias y Logros dinámicos
  const badges = useMemo(() => [
    {
      id: "first_emotion",
      icon: "🌟",
      text: language === "es" ? "Primera Emoción" : "First Emotion",
      unlocked: emotionsCount >= 1,
      hint: language === "es" ? "Registra tu primer estado de ánimo" : "Log your first emotion",
    },
    {
      id: "streak_3",
      icon: "🔥",
      text: language === "es" ? "3 Días Seguidos" : "3-Day Streak",
      unlocked: streak >= 3,
      hint: language === "es" ? "Mantén una racha activa de 3 días" : "Keep a 3-day active streak",
    },
    {
      id: "streak_7",
      icon: "💪",
      text: language === "es" ? "Semana Imparable" : "Unstoppable Week",
      unlocked: streak >= 7,
      hint: language === "es" ? "Alcanza una racha de 7 días" : "Reach a 7-day streak",
    },
    {
      id: "wellbeing_70",
      icon: "💜",
      text: language === "es" ? "Semana Saludable" : "Healthy Week",
      unlocked: wellbeing >= 70,
      hint: language === "es" ? "Alcanza más del 70% de bienestar" : "Reach over 70% wellbeing",
    },
    {
      id: "challenge_1",
      icon: "🎯",
      text: language === "es" ? "Primer Reto" : "First Challenge",
      unlocked: challengesCount >= 1,
      hint: language === "es" ? "Completa tu primer reto de bienestar" : "Complete your first challenge",
    },
    {
      id: "challenge_3",
      icon: "🏆",
      text: language === "es" ? "Mente Positiva" : "Positive Mindset",
      unlocked: challengesCount >= 3,
      hint: language === "es" ? "Supera 3 retos diarios" : "Complete 3 daily challenges",
    },
    {
      id: "breathing_1",
      icon: "🧘",
      text: language === "es" ? "Pausa Consciente" : "Mindful Pause",
      unlocked: breathingCount >= 1,
      hint: language === "es" ? "Realiza 1 sesión de respiración" : "Complete 1 breathing session",
    },
    {
      id: "breathing_3",
      icon: "🌊",
      text: language === "es" ? "Respiración Zen" : "Zen Breathing",
      unlocked: breathingCount >= 3,
      hint: language === "es" ? "Completa 3 ejercicios de respiración" : "Complete 3 breathing exercises",
    },
    {
      id: "meditation_1",
      icon: "🧠",
      text: language === "es" ? "Momento de Paz" : "Moment of Peace",
      unlocked: meditationCount >= 1,
      hint: language === "es" ? "Completa tu primera meditación" : "Complete your first meditation",
    },
    {
      id: "notes_2",
      icon: "📝",
      text: language === "es" ? "Mente Consciente" : "Mindful Notes",
      unlocked: notesCount >= 2,
      hint: language === "es" ? "Registra 2 o más reflexiones personales" : "Log 2 or more notes",
    },
  ], [language, emotionsCount, streak, wellbeing, challengesCount, breathingCount, meditationCount, notesCount]);

  // Notificar al desbloquear una insignia nueva
  const prevUnlockedIdsRef = useRef(new Set());
  useEffect(() => {
    const currentlyUnlocked = badges.filter((b) => b.unlocked).map((b) => b.id);
    const newUnlocked = currentlyUnlocked.filter((id) => !prevUnlockedIdsRef.current.has(id));

    // Si hubo alguna desbloqueada nueva durante la sesión
    if (prevUnlockedIdsRef.current.size > 0 && newUnlocked.length > 0 && triggerNotification) {
      newUnlocked.forEach((id) => {
        const badgeObj = badges.find((b) => b.id === id);
        if (badgeObj) {
          triggerNotification({
            type: "wellness",
            title: language === "es" ? `🎉 ¡Nueva Insignia Desbloqueada!` : `🎉 New Badge Unlocked!`,
            body: `${badgeObj.icon} ${badgeObj.text}: ${badgeObj.hint}`,
            duration: 6000,
          });
        }
      });
    }

    prevUnlockedIdsRef.current = new Set(currentlyUnlocked);
  }, [badges, triggerNotification, language]);

  // Persistir en perfil si hay cambios
  useEffect(() => {
    if (!updateUserProfile) return;
    try {
       localStorage.setItem(userStorageKey(user?.uid, "user_goals_progress"), JSON.stringify(goals));
       const unlockedIds = badges.filter((b) => b.unlocked).map((b) => b.id);
       localStorage.setItem(userStorageKey(user?.uid, "feelsafe_unlocked_badges"), JSON.stringify(unlockedIds));
    } catch {}
  }, [goals, badges, updateUserProfile, user?.uid]);

  const totalGoals = goals.length;
  const completedGoalsCount = goals.filter((g) => g.progress >= g.total).length;
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <MainLayout>
      <div className="goals-container">
        {/* ENCABEZADO */}
        <div className="goals-header">
          <h1 className="page-title">
            🎯 {language === "es" ? "Objetivos y Logros Automáticos" : "Automatic Goals & Achievements"}
          </h1>
          <p>
            {language === "es"
              ? "Tus objetivos e insignias se completan automáticamente cuando realizas retos, respiraciones, notas y emociones en FeelSafe."
              : "Your goals and badges update automatically as you complete challenges, breathing, notes, and mood check-ins."}
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
              <h3>
                {streak} {language === "es" ? (streak === 1 ? "día" : "días") : (streak === 1 ? "day" : "days")}
              </h3>
              <p>
                {streak > 0
                  ? language === "es"
                    ? "¡Excelente consistencia! Sigue registrando a diario."
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
              <h2>{language === "es" ? "Nivel de Progreso" : "Progress Level"}</h2>
              <h3>{getUserLevel()}</h3>
              <p>
                {language === "es"
                  ? `${unlockedBadgesCount} de ${badges.length} insignias desbloqueadas.`
                  : `${unlockedBadgesCount} of ${badges.length} badges unlocked.`}
              </p>
            </div>
          </div>
        </div>

        {/* OBJETIVOS ACTIVOS AUTOMÁTICOS */}
        <div className="progress-section">
          <div className="progress-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {language === "es" ? "Objetivos Dinámicos del Usuario" : "Active Dynamic Goals"}
            </h2>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light, #7A6A91)" }}>
              {completedGoalsCount} / {totalGoals} {language === "es" ? "cumplidos" : "completed"}
            </span>
          </div>

          <div className="progress-list">
            {goals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.progress / goal.total) * 100));
              const isCompleted = goal.progress >= goal.total;

              return (
                <div
                  className={`progress-card ${isCompleted ? "completed" : ""}`}
                  key={goal.id}
                >
                  <div className="progress-info">
                    <div className="progress-title">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong>{goal.title}</strong>
                        <span className="goal-auto-badge">
                          <FaBolt /> Auto
                        </span>
                      </div>
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

                  {isCompleted ? (
                    <span className="goal-completed-badge">
                      <FaCheckCircle /> {language === "es" ? "¡Cumplido!" : "Completed!"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="goal-action-btn"
                      onClick={() => navigate(goal.actionRoute)}
                    >
                      {goal.actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* INSIGNIAS Y LOGROS DESBLOQUEABLES */}
        <div className="badges-section">
          <h2 className="section-title">
            <FaStar className="star-icon" /> {language === "es" ? "Mis Insignias y Logros" : "My Badges & Achievements"}
          </h2>

          <div className="badges-grid">
            {badges.map((badge) => (
              <div
                className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}
                key={badge.id}
                title={badge.hint}
              >
                <div className="badge-icon-bg">
                  <span className="badge-emoji">{badge.icon}</span>
                  {!badge.unlocked && <FaLock className="badge-lock-overlay" />}
                </div>
                <span className="badge-text">{badge.text}</span>
                <span className="badge-hint">{badge.hint}</span>
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

