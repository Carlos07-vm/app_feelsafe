import "../styles/Home.css";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
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

function Home() {
  const { user, loading } = useApp();
  const navigate = useNavigate();

  // 🔄 Loading state
  if (loading) {
    return (
      <MainLayout>
        <p style={{ textAlign: "center" }}>Cargando tu información...</p>
      </MainLayout>
    );
  }

  // ❌ Si no hay usuario
  if (!user) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>Debes iniciar sesión</h2>
          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              border: "none",
              background: "#7b61ff",
              color: "white",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Ir a Login
          </button>
        </div>
      </MainLayout>
    );
  }

  // 🔥 Logout
  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const moodLabel = user.currentMood || "Neutral";

  return (
    <MainLayout>
      {/* Bienvenida */}
      <div className="welcome-card">
        <h1>Hola 👋 {user.name || "Usuario"}</h1>

        <p>
          Bienvenido a FeelSafe. Estamos aquí para ayudarte a cuidar tu bienestar emocional.
        </p>

        <button
          onClick={logout}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            border: "none",
            background: "#ff4d6d",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <StatCard title="Estado Actual" value={moodLabel} icon={<FaSmile />} />
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
      </div>

      {/* Mensaje motivacional */}
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