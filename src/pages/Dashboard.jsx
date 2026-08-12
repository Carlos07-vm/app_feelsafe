import "../styles/Dashboard.css";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaSmile, FaHeartbeat, FaBrain, FaChartLine } from "react-icons/fa";

function Dashboard() {
  const { user, loading } = useApp();
  const navigate = useNavigate();

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
        <p className="loading-text">Cargando tu información...</p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="dashboard-login">
          <h2>Debes iniciar sesión</h2>
          <button className="login-btn" onClick={() => navigate("/login")}>Ir a Iniciar Sesión</button>
        </div>
      </MainLayout>
    );
  }

  const moodLabel = user.currentMood || "Neutral";
  const latestNote = user.notes?.[user.notes.length - 1];

  const quickActions = [
    { title: "Registrar emoción", label: "Ir a tu registro diario", path: "/mood" },
    { title: "Habla con IA", label: "Accede a tu asistente seguro", path: "/chat" },
    { title: "Explorar recursos", label: "Apoyos y herramientas", path: "/resources" },
  ];

  return (
    <MainLayout>
      <section className="dashboard-hero">
        <div className="hero-content">
          <span className="hero-label">Panel de Bienestar</span>
          <h1>{greeting}, {user.displayName || user.name || user?.nombre || "Usuario"}</h1>
          <p>Este es tu espacio seguro para revisar tu estado y dar pequeños pasos hacia un día más tranquilo.</p>
        </div>

        <div className="hero-summary">
          <div className="hero-summary-card">
            <small>Bienestar</small>
            <strong>{user.wellbeing ?? 0}%</strong>
          </div>
          <div className="hero-summary-card">
            <small>Racha</small>
            <strong>{user.streak ?? 0} días</strong>
          </div>
          <button className="hero-action" type="button" onClick={() => navigate("/mood")}>Registrar hoy</button>
        </div>
      </section>

      <section className="dashboard-summary-grid">
        <StatCard title="Estado Actual" value={moodLabel} icon={<FaSmile />} />
        <StatCard title="Bienestar" value={`${user.wellbeing || 0}%`} icon={<FaHeartbeat />} />
        <StatCard title="IA" value={user.aiStatus || "Activa"} icon={<FaBrain />} />
        <StatCard title="Racha" value={`${user.streak || 0} días`} icon={<FaChartLine />} />
      </section>

      <section className="dashboard-actions">
        <div className="dashboard-actions-header">
          <div>
            <h2>Acciones rápidas</h2>
            <p>Encuentra lo que necesitas sin perder tiempo.</p>
          </div>
        </div>

        <div className="actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <div>
                <h3>{action.title}</h3>
                <p>{action.label}</p>
              </div>
              <span>→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="activity-card">
          <div className="activity-header">
            <div>
              <h2>Último registro</h2>
              <p className="card-subtitle">Tu progreso visible de un vistazo.</p>
            </div>
            <span>{moodLabel}</span>
          </div>

          <p className="activity-text">
            {latestNote
              ? latestNote.text
              : "Aún no tienes notas registradas. Comienza por compartir cómo te sientes hoy."}
          </p>

          <div className="activity-details">
            <div>
              <strong>{moodLabel}</strong>
              <span>Estado actual</span>
            </div>
            <div>
              <strong>{user.wellbeing || 0}%</strong>
              <span>Bienestar</span>
            </div>
          </div>
        </div>

        <div className="motivation-card">
          <h2>🌿 Mensaje de calma</h2>
          <p>Confía en cada paso pequeño: el progreso no tiene que ser perfecto, solo constante.</p>
          <div className="motivation-footer">Tu bienestar merece atención amable y constante.</div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Dashboard;
