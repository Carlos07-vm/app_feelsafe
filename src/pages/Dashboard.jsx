import "../styles/Dashboard.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaSmile,
  FaHeartbeat,
  FaBrain,
  FaChartLine,
  FaArrowRight,
  FaUserCircle,
  FaLeaf,
  FaRegEdit,
  FaRegCommentDots,
  FaChevronDown,
  FaCalendarAlt,
  FaRegFileAlt
} from "react-icons/fa";

function Dashboard() {
  const { user, loading } = useApp();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  let greeting = "Hola";
  if (hour >= 5 && hour < 12) greeting = "Buenos días";
  else if (hour >= 12 && hour < 18) greeting = "Buenas tardes";
  else greeting = "Buenas noches";

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">Cargando tu información...</p>
      </MainLayout>
    );
  }

  const userName = user?.displayName || user?.nombre || "Usuario";
  const profilePhoto = user?.photoURL || user?.foto || "";
  const wellbeing = user?.wellbeing ?? 72;
  const streak = user?.streak ?? 2;
  const aiStatus = user?.aiStatus || "Activa";
  const latestNote = user?.notes?.[user.notes.length - 1];

  return (
    <MainLayout>
      <div className="dashboard-wrapper">
        
        {/* =================================================
            BARRA SUPERIOR (Perfil a la derecha)
        ================================================= */}
        <div className="dashboard-topbar">

          <div className="topbar-profile" onClick={() => navigate("/profile")}>
            <div className="topbar-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Perfil" />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <span className="topbar-name">{userName}</span>
            <FaChevronDown className="topbar-arrow" />
          </div>
        </div>

        {/* =================================================
            HERO PRINCIPAL (Color morado puro e intenso)
        ================================================= */}
        <section className="dashboard-hero-solid">
          <div className="hero-text-content">
            <span className="hero-tag">PANEL DE BIENESTAR</span>
            <h1>{greeting}, {userName}</h1>
            <p>
              Un espacio para comprender cómo te sientes, cuidar de ti y avanzar a tu propio ritmo.
            </p>
          </div>

          <div className="hero-widgets">
            <div className="hero-widgets-row">
              <div className="hero-widget-card">
                <div className="widget-icon"><FaLeaf /></div>
                <small>Bienestar actual</small>
                <strong>{wellbeing}%</strong>
                <div className="widget-bar"><div className="widget-fill" style={{width: `${wellbeing}%`}}></div></div>
              </div>
              
              <div className="hero-widget-card">
                <div className="widget-icon"><FaFire /></div>
                <small>Racha actual</small>
                <strong>{streak} días</strong>
                <div className="widget-bar"><div className="widget-fill" style={{width: '30%'}}></div></div>
              </div>
            </div>
            
            <button className="hero-main-btn" onClick={() => navigate("/mood")}>
              Registrar hoy <FaArrowRight />
            </button>
          </div>
        </section>

        {/* =================================================
            ESTADÍSTICAS (4 Columnas)
        ================================================= */}
        <section className="stats-4col">
          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-purple"><FaSmile /></div>
            <div className="stat-info">
              <small>Estado emocional</small>
              <strong>Neutro</strong>
              <span className="stat-sub"><span className="dot dot-purple"></span> Hoy</span>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-light-purple"><FaHeartbeat /></div>
            <div className="stat-info">
              <small>Bienestar</small>
              <strong>{wellbeing}%</strong>
              <span className="stat-sub"><span className="dot dot-light-purple"></span> Hoy</span>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-pink"><FaBrain /></div>
            <div className="stat-info">
              <small>Asistente IA</small>
              <strong>{aiStatus}</strong>
              <span className="stat-sub">Disponible 24/7</span>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-blue"><FaChartLine /></div>
            <div className="stat-info">
              <small>Racha</small>
              <strong>{streak} días</strong>
              <span className="stat-sub">¡Sigue así!</span>
            </div>
          </div>
        </section>

        {/* =================================================
            ACCIONES RÁPIDAS
        ================================================= */}
        <h2 className="section-title">Acciones rápidas</h2>
        <section className="actions-3col">
          <button className="action-color-card color-purple" onClick={() => navigate("/specialist")}>
            <div className="action-left">
              <div className="action-circle"><FaRegCommentDots /></div>
              <div className="action-texts">
                <h3>Hablar con especialista</h3>
                <p>Sesión personalizada</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button className="action-color-card color-blue" onClick={() => navigate("/chat")}>
            <div className="action-left">
              <div className="action-circle"><FaBrain /></div>
              <div className="action-texts">
                <h3>Hablar con IA</h3>
                <p>Orientación y apoyo</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button className="action-color-card color-green" onClick={() => navigate("/mood")}>
            <div className="action-left">
              <div className="action-circle"><FaRegEdit /></div>
              <div className="action-texts">
                <h3>Registrar emociones</h3>
                <p>¿Cómo te sientes hoy?</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>
        </section>

        {/* =================================================
            SECCIÓN INFERIOR
        ================================================= */}
        <section className="bottom-2col">
          
          <div className="last-record-card">
            <div className="record-header">
              <div className="record-title-area">
                <FaCalendarAlt className="record-title-icon" />
                <h3>Último registro</h3>
              </div>
              <span className="record-date">Hoy, 16:42</span>
            </div>
            <p className="record-desc">Tu registro más reciente nos ayuda a entender cómo te sientes.</p>
            
            <div className="record-mini-cards">
              <div className="mini-card">
                <div className="mini-icon bg-purple"><FaSmile /></div>
                <div>
                  <small>Estado emocional</small>
                  <strong>Neutro</strong>
                </div>
              </div>
              <div className="mini-card">
                <div className="mini-icon bg-light-purple"><FaHeartbeat /></div>
                <div>
                  <small>Bienestar</small>
                  <strong>{wellbeing}%</strong>
                </div>
              </div>
            </div>

            <div className="record-notes">
              <div className="notes-header">
                <FaRegFileAlt /> <strong>Notas del día</strong>
              </div>
              <p>{latestNote ? latestNote.text : "Me siento tranquilo y enfocado. Tuve un día productivo."}</p>
            </div>
          </div>

          <div className="calm-message-card">
            <div className="calm-header">
              <FaLeaf className="calm-icon" />
              <h3>Mensaje de calma</h3>
            </div>
            <p className="calm-subtitle">Respira, estás haciendo lo mejor que puedes con lo que tienes hoy.</p>
            
            <div className="calm-quote">
              <span className="quote-mark left">“</span>
              <p>Tu bienestar merece atención, paciencia y compasión.</p>
              <span className="quote-mark right">”</span>
            </div>
          </div>

        </section>

      </div>
    </MainLayout>
  );
}

// Icono extra de fuego
function FaFire() {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"></path>
    </svg>
  );
}

export default Dashboard;