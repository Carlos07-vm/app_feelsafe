import "../styles/Goals.css";
import MainLayout from "../layouts/MainLayout";
import {
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { useState } from "react";

function Goals() {
  const [goals, setGoals] = useState([
    {
      title: "Registrar emociones",
      progress: 6,
      total: 7,
      color: "#7B61FF",
    },
    {
      title: "Meditar",
      progress: 4,
      total: 7,
      color: "#5B3CC4",
    },
    {
      title: "Dormir 8 horas",
      progress: 5,
      total: 7,
      color: "#A78BFA",
    },
  ]);

  const badges = [
    "🌟 Primera emoción registrada",
    "🔥 5 días consecutivos",
    "💜 Semana saludable",
    "🧠 IA Consultada",
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

      <h1 className="page-title">
        🎯 Objetivos y Logros
      </h1>

      <div className="goals-grid">

        <div className="goal-card">

          <FaFire className="goal-icon"/>

          <h2>Racha actual</h2>

          <h1>12 días</h1>

          <p>
            Sigue registrando tus emociones todos los días.
          </p>

        </div>

        <div className="goal-card">

          <FaTrophy className="goal-icon"/>

          <h2>Nivel</h2>

          <h1>Explorador Emocional</h1>

          <p>
            Continúa avanzando para desbloquear nuevos logros.
          </p>

        </div>

      </div>

      <div className="progress-section">

        <h2>Objetivos Semanales</h2>

        {goals.map((goal, index) => {

          const percent = (goal.progress / goal.total) * 100;

          return (

            <div className="progress-card" key={index}>

              <div className="progress-title">

                <span>{goal.title}</span>

                <span>{goal.progress}/{goal.total}</span>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${percent}%`,
                    background: goal.color,
                  }}
                />

              </div>

              <button
                type="button"
                className="goal-action"
                onClick={() => handleComplete(index)}
              >
                {goal.progress >= goal.total ? "Completado" : "Registrar avance"}
              </button>

            </div>

          );
        })}

      </div>

      <div className="badges-section">

        <h2>
          <FaStar /> Insignias
        </h2>

        <div className="badges-grid">

          {badges.map((badge, index) => (

            <div className="badge-card" key={index}>

              <FaCheckCircle />

              <span>{badge}</span>

            </div>

          ))}

        </div>

      </div>

    </MainLayout>
  );
}

export default Goals;