import "../styles/Dashboard.css";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import MoodSelector from "../components/MoodSelector";
import { useApp } from "../context/AppContext";

import {
  FaSmile,
  FaBrain,
  FaHeartbeat,
  FaChartLine,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, loading } = useApp();
  const navigate = useNavigate();

  // Saludo según la hora
  const hour = new Date().getHours();

  let greeting = "Hola";

  if (hour >= 5 && hour < 12) {
    greeting = "Buenos días";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Buenas tardes";
  } else {
    greeting = "Buenas noches";
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">
          Cargando tu información...
        </p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>

        <div className="dashboard-login">

          <h2>Debes iniciar sesión</h2>

          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Ir a Iniciar Sesión
          </button>

        </div>

      </MainLayout>
    );
  }

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const moodLabel = user.currentMood || "Neutral";

  return (
    <MainLayout>

      {/* ================= Bienvenida ================= */}

      <section className="welcome-card">

        <div className="welcome-content">

          <h1>
            {greeting}, {user.displayName || user.name || user?.nombre} 👋
          </h1>

          <p>
            Bienvenido nuevamente a FeelSafe.
          </p>

          <p className="welcome-subtitle">
            Tu bienestar comienza con pequeños pasos cada día.
          </p>

        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Cerrar sesión
        </button>

      </section>

      {/* Aquí irá el selector de emociones */}

      <MoodSelector />

      {/* ================= Estadísticas ================= */}

      <section className="stats-grid">

        <StatCard
          title="Estado Actual"
          value={moodLabel}
          icon={<FaSmile />}
        />

        <StatCard
          title="Bienestar"
          value={`${user.wellbeing || 0}%`}
          icon={<FaHeartbeat />}
        />

        <StatCard
          title="IA"
          value={user.aiStatus || "Activa"}
          icon={<FaBrain />}
        />

        <StatCard
          title="Racha"
          value={`${user.streak || 0} días`}
          icon={<FaChartLine />}
        />

      </section>

      {/* ================= Frase del día ================= */}

      <section className="motivation-card">

        <h2>💜 Frase del día</h2>

        <p>
          Tu salud mental merece el mismo cuidado que tu salud física.
          Un pequeño paso hoy puede marcar una gran diferencia mañana.
        </p>

      </section>

      {/* ================= Próxima fase ================= */}

      {/* Aquí irá la actividad reciente */}

      {/* Aquí irán los recordatorios */}

    </MainLayout>
  );
}

export default Dashboard;