import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const getMoodColor = (mood) => {
    switch (mood?.toLowerCase()) {
      case "feliz":
        return "#4CAF50";
      case "triste":
        return "#2196F3";
      case "estresado":
        return "#FF9800";
      case "ansioso":
        return "#E91E63";
      case "enojado":
        return "#F44336";
      default:
        return "#6c63ff";
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        <h1 className="page-title">👤 Mi Perfil</h1>

        <div className="profile-card">

          <div className="avatar">
            {user?.profile?.avatar || "👤"}
          </div>

          <h2>{user?.profile?.name}</h2>

          <p>🎂 Edad: {user?.profile?.age} años</p>

          <div
            className="mood-badge"
            style={{ backgroundColor: getMoodColor(user?.currentMood) }}
          >
            😊 {user?.currentMood}
          </div>

          <div className="wellbeing-section">
            <div className="wellbeing-header">
              <span>Bienestar</span>
              <span>{user?.wellbeing}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${user?.wellbeing}%` }}
              ></div>
            </div>
          </div>

          <div className="stats">

            <div className="stat-card">
              <h3>{user?.streak}</h3>
              <p>🔥 Racha</p>
            </div>

            <div className="stat-card">
              <h3>{user?.notes?.length || 0}</h3>
              <p>📝 Notas</p>
            </div>

            <div className="stat-card">
              <h3>{user?.wellbeing}%</h3>
              <p>💚 Salud</p>
            </div>

          </div>

          {user?.notes?.length > 0 && (
            <div className="profile-notes">
              <h3>📝 Última nota</h3>
              <p>{user.notes[user.notes.length - 1].text}</p>
            </div>
          )}

          <div className="motivation-card">
            <h3>💙 Frase del día</h3>
            <p>
              Cada pequeño paso que das hacia tu bienestar cuenta.
              Sigue adelante, hoy también es una oportunidad para crecer.
            </p>
          </div>

          <div className="profile-buttons">

            <button className="edit-btn">
              ✏️ Editar perfil
            </button>

            <button className="settings-btn">
              ⚙️ Configuración
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Cerrar sesión
            </button>

          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;