import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { useApp } from "../context/AppContext";
import {
  FaSmile,
  FaBrain,
  FaHeartbeat,
  FaChartLine,
} from "react-icons/fa";

function Home() {
  const { user } = useApp();
  const moodLabel = user.currentMood || "Bienvenido";

  return (
    <MainLayout>
      <div className="welcome-card">
        <h1>Hola 👋 {user.profile.name}</h1>

        <p>
          Bienvenido a FeelSafe. Estamos aquí para ayudarte a cuidar tu bienestar emocional.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard title="Estado Actual" value={moodLabel} icon={<FaSmile />} />
        <StatCard title="Bienestar" value={`${user.wellbeing}%`} icon={<FaHeartbeat />} />
        <StatCard title="IA" value={user.aiStatus} icon={<FaBrain />} />
        <StatCard title="Racha" value={`${user.streak} días`} icon={<FaChartLine />} />
      </div>

      <div className="motivation-card">
        <h2>💜 Frase del día</h2>

        <p>
          Tu salud mental es tan importante como tu salud física.
        </p>
      </div>
    </MainLayout>
  );
}

export default Home;
