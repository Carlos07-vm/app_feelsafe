import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import {
  FaSmile,
  FaBrain,
  FaHeartbeat,
  FaChartLine,
} from "react-icons/fa";

function Home() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <div className="welcome-card">
          <h1>Hola 👋 Carlos</h1>

          <p>
            Bienvenido a FeelSafe. Estamos aquí para ayudarte a cuidar tu bienestar emocional.
          </p>
        </div>

        <div className="stats-grid">

          <StatCard
            title="Estado Actual"
            value="😊 Feliz"
            icon={<FaSmile />}
          />
          <StatCard
            title="Bienestar"
            value="85%"
            icon={<FaHeartbeat />}
          />
          <StatCard
            title="IA"
            value="Activa"
            icon={<FaBrain />}
          />

          <StatCard
            title="Registros"
            value="12"
            icon={<FaChartLine />}
          />

        </div>

        <div className="motivation-card">
          <h2>💜 Frase del día</h2>

          <p>
            Tu salud mental es tan importante como tu salud física.
          </p>
        </div>

      </main>

    </div>
  );
}

export default Home;