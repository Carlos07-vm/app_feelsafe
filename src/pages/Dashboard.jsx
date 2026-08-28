import "../styles/Dashboard.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { translations } from "../constants/translations"; 
import { useState, useEffect } from "react"; // <-- IMPORTAMOS HOOKS

// --- FIREBASE (TIEMPO REAL) ---
import { db } from "../services/firebase";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";

import {
  FaSmile, FaHeartbeat, FaBrain, FaChartLine, FaArrowRight,
  FaUserCircle, FaLeaf, FaRegEdit, FaRegCommentDots,
  FaChevronDown, FaCalendarAlt, FaRegFileAlt
} from "react-icons/fa";

function Dashboard() {
  const { user, loading, language } = useApp(); 
  const navigate = useNavigate();
  const t = translations[language] || translations.es;

  // ==================== ESTADOS EN TIEMPO REAL ====================
  // Guardamos las métricas que cambiarán en vivo
  const [liveStats, setLiveStats] = useState({
    wellbeing: 72,
    streak: 0,
    aiStatus: "Activa"
  });
  const [lastRecord, setLastRecord] = useState(null); // Guarda el último registro emocional

  useEffect(() => {
    if (!user?.uid) return;

    // 1. ESCUCHADOR DEL PERFIL (Racha y Bienestar)
    // Se dispara automáticamente si cambian los datos del usuario en Firebase
    const userRef = doc(db, "usuarios", user.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveStats({
          wellbeing: data.wellbeing ?? 72,
          streak: data.streak ?? 0,
          aiStatus: data.aiStatus ?? "Activa"
        });
      }
    });

    // 2. ESCUCHADOR DEL ÚLTIMO REGISTRO EMOCIONAL
    // Trae únicamente el documento más reciente basado en la fecha
    const recordsQuery = query(
      collection(db, "registros_emocionales"),
      where("uidUsuario", "==", user.uid),
      orderBy("fecha", "desc"),
      limit(1)
    );

    const unsubRecords = onSnapshot(recordsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setLastRecord(snapshot.docs[0].data());
      } else {
        setLastRecord(null);
      }
    });

    // Limpieza: Cerramos las conexiones cuando el usuario sale del Dashboard
    return () => {
      unsubUser();
      unsubRecords();
    };
  }, [user]);

  // ==================== LÓGICA DE SALUDO ====================
  const hour = new Date().getHours();
  let greeting = "Hola";
  if (hour >= 5 && hour < 12) greeting = t.morning;
  else if (hour >= 12 && hour < 18) greeting = t.afternoon;
  else greeting = t.evening;

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">Cargando...</p>
      </MainLayout>
    );
  }

  // ==================== VARIABLES DE INTERFAZ ====================
  const userName = user?.displayName || user?.nombre || "Usuario";
  const profilePhoto = user?.photoURL || user?.foto || "";
  
  // Extraemos la emoción y nota del último registro (si existe)
  const currentEmotion = lastRecord?.emocion || "Neutro";
  const currentNote = lastRecord?.nota || "Aún no has registrado notas hoy.";

  return (
    <MainLayout>
      <div className="dashboard-wrapper">
        
        <div className="dashboard-topbar">
          <div className="topbar-profile" onClick={() => navigate("/profile")}>
            <div className="topbar-avatar">
              {profilePhoto ? <img src={profilePhoto} alt="Perfil" /> : <FaUserCircle />}
            </div>
            <span className="topbar-name">{userName}</span>
            <FaChevronDown className="topbar-arrow" />
          </div>
        </div>

        <section className="dashboard-hero-solid">
          <div className="hero-text-content">
            <span className="hero-tag">PANEL DE BIENESTAR</span>
            <h1>{greeting}, {userName}</h1>
            <p>{t.dashSubtitle}</p>
          </div>

          <div className="hero-widgets">
            <div className="hero-widgets-row">
              <div className="hero-widget-card">
                <div className="widget-icon"><FaLeaf /></div>
                <small>{t.wellbeing}</small>
                <strong>{liveStats.wellbeing}%</strong>
                <div className="widget-bar"><div className="widget-fill" style={{width: `${liveStats.wellbeing}%`}}></div></div>
              </div>
              
              <div className="hero-widget-card">
                <div className="widget-icon"><FaFire /></div>
                <small>{t.streak}</small>
                <strong>{liveStats.streak} días</strong>
                <div className="widget-bar">
                  {/* Calculamos un ancho visual dinámico para la barra de racha (max 30 días para llenar) */}
                  <div className="widget-fill" style={{width: `${Math.min((liveStats.streak / 30) * 100, 100)}%`}}></div>
                </div>
              </div>
            </div>
            
            <button className="hero-main-btn" onClick={() => navigate("/mood")}>
              {t.recordToday} <FaArrowRight />
            </button>
          </div>
        </section>

        <section className="stats-4col">
          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-purple"><FaSmile /></div>
            <div className="stat-info">
              <small>{t.emotionalState}</small>
              <strong style={{ textTransform: "capitalize" }}>{currentEmotion}</strong>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-light-purple"><FaHeartbeat /></div>
            <div className="stat-info">
              <small>{t.wellbeing}</small>
              <strong>{liveStats.wellbeing}%</strong>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-pink"><FaBrain /></div>
            <div className="stat-info">
              <small>{t.aiAssistant}</small>
              <strong>{liveStats.aiStatus}</strong>
            </div>
          </div>

          <div className="stat-clean-card">
            <div className="stat-icon-circle bg-blue"><FaChartLine /></div>
            <div className="stat-info">
              <small>{t.streak}</small>
              <strong>{liveStats.streak} días</strong>
            </div>
          </div>
        </section>

        <h2 className="section-title">{t.quickActions}</h2>
        <section className="actions-3col">
          <button className="action-color-card color-purple" onClick={() => navigate("/specialists")}>
            <div className="action-left">
              <div className="action-circle"><FaRegCommentDots /></div>
              <div className="action-texts">
                <h3>{t.speakSpecialist}</h3>
                <p>{t.speakSpecialistSub}</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button className="action-color-card color-blue" onClick={() => navigate("/chat")}>
            <div className="action-left">
              <div className="action-circle"><FaBrain /></div>
              <div className="action-texts">
                <h3>{t.speakAI}</h3>
                <p>{t.speakAISub}</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button className="action-color-card color-green" onClick={() => navigate("/mood")}>
            <div className="action-left">
              <div className="action-circle"><FaRegEdit /></div>
              <div className="action-texts">
                <h3>{t.recordEmotions}</h3>
                <p>{t.recordEmotionsSub}</p>
              </div>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>
        </section>

        <section className="bottom-2col">
          
          <div className="last-record-card">
            <div className="record-header">
              <div className="record-title-area">
                <FaCalendarAlt className="record-title-icon" />
                <h3>{t.lastRecord}</h3>
              </div>
            </div>
            <p className="record-desc">{t.lastRecordDesc}</p>
            
            <div className="record-mini-cards">
              <div className="mini-card">
                <div className="mini-icon bg-purple"><FaSmile /></div>
                <div>
                  <small>{t.emotionalState}</small>
                  <strong style={{ textTransform: "capitalize" }}>{currentEmotion}</strong>
                </div>
              </div>
              <div className="mini-card">
                <div className="mini-icon bg-light-purple"><FaHeartbeat /></div>
                <div>
                  <small>{t.wellbeing}</small>
                  <strong>{liveStats.wellbeing}%</strong>
                </div>
              </div>
            </div>

            <div className="record-notes">
              <div className="notes-header">
                <FaRegFileAlt /> <strong>{t.notesOfDay}</strong>
              </div>
              <p>{currentNote}</p>
            </div>
          </div>

          <div className="calm-message-card">
            <div className="calm-header">
              <FaLeaf className="calm-icon" />
              <h3>{t.calmMessage}</h3>
            </div>
            <p className="calm-subtitle">{t.calmSubtitle}</p>
            
            <div className="calm-quote">
              <span className="quote-mark left">“</span>
              <p>{t.calmQuote}</p>
              <span className="quote-mark right">”</span>
            </div>
          </div>

        </section>
      </div>
    </MainLayout>
  );
}

// Componente para el ícono de Fuego (Racha)
function FaFire() {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"></path>
    </svg>
  );
}

export default Dashboard;