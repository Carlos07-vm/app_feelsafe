import "../styles/Goals.css";
import MainLayout from "../layouts/MainLayout";
import {
  FaTrophy,
  FaFire,
  FaStar,
} from "react-icons/fa";
import { useState } from "react";

function Goals() {
  const [goals, setGoals] = useState([
    {
      title: "Registrar emociones",
      progress: 6,
      total: 7,
      color: "linear-gradient(135deg, #A855F7, #7B61FF)",
    },
    {
      title: "Meditar",
      progress: 4,
      total: 7,
      color: "linear-gradient(135deg, #3B82F6, #2563EB)",
    },
    {
      title: "Dormir 8 horas",
      progress: 5,
      total: 7,
      color: "linear-gradient(135deg, #10B981, #059669)",
    },
  ]);

  // Separamos el icono del texto para estilizarlos como medallas reales
  const badges = [
    { icon: "🌟", text: "Primera emoción" },
    { icon: "🔥", text: "5 días seguidos" },
    { icon: "💜", text: "Semana saludable" },
    { icon: "🧠", text: "IA Consultada" },
  ];

  const handleComplete = (index) => {
    setGoals((current) =>
      current.map((goal, idx) => {
        if (idx !== index) return goal;
        const progress = Math.min(goal.total, goal.progress + 1);
        return { ...goal, progress };
      })
    );
  };

  return (
    <MainLayout>
      <div className="goals-container">

        {/* ENCABEZADO */}
        <div className="goals-header">
          <h1 className="page-title">
            🎯 Objetivos y Logros
          </h1>
          <p>Supera tus metas y desbloquea nuevas insignias de bienestar.</p>
        </div>

        {/* TARJETAS SUPERIORES (Estilo consistente con Alertas) */}
        <div className="goals-top-grid">
          <div className="goal-top-card card-orange">
            <div className="goal-icon-wrapper">
              <FaFire className="goal-top-icon" />
            </div>
            <div className="goal-top-content">
              <h2>Racha actual</h2>
              <h3>12 días</h3>
              <p>Sigue registrando tus emociones todos los días.</p>
            </div>
          </div>

          <div className="goal-top-card card-purple">
            <div className="goal-icon-wrapper">
              <FaTrophy className="goal-top-icon" />
            </div>
            <div className="goal-top-content">
              <h2>Nivel</h2>
              <h3>Explorador Emocional</h3>
              <p>Continúa avanzando para desbloquear nuevos logros.</p>
            </div>
          </div>
        </div>

        {/* OBJETIVOS SEMANALES */}
        <div className="progress-section">
          <h2 className="section-title">Objetivos Semanales</h2>

          <div className="progress-list">
            {goals.map((goal, index) => {
              const percent = (goal.progress / goal.total) * 100;
              const isCompleted = goal.progress >= goal.total;

              return (
                <div className={`progress-card ${isCompleted ? "completed" : ""}`} key={index}>
                  
                  <div className="progress-info">
                    <div className="progress-title">
                      <strong>{goal.title}</strong>
                      <span>{goal.progress} / {goal.total}</span>
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
                    onClick={() => handleComplete(index)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? "Completado" : "Registrar avance"}
                  </button>
                  
                </div>
              );
            })}
          </div>
        </div>

        {/* INSIGNIAS (LOGROS) */}
        <div className="badges-section">
          <h2 className="section-title">
            <FaStar className="star-icon" /> Mis Insignias
          </h2>

          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div className="badge-card" key={index}>
                <div className="badge-icon-bg">
                  <span className="badge-emoji">{badge.icon}</span>
                </div>
                <span className="badge-text">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default Goals;