import "../styles/Dashboard.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { translations } from "../constants/translations"; 
import { localDateKey } from "../utils/date";
import { useState, useEffect } from "react";

// --- FIREBASE (TIEMPO REAL) ---
import { db } from "../services/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";

import {
  FaSmile, FaHeartbeat, FaBrain, FaChartLine, FaArrowRight,
  FaUserCircle, FaLeaf, FaRegEdit, FaRegCommentDots,
  FaChevronDown, FaCalendarAlt, FaRegFileAlt, FaFire
} from "react-icons/fa";

function Dashboard() {
  const { user, loading, language } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.es;
  const userId = user?.uid;

  // ==================== ESTADOS EN TIEMPO REAL ====================
  // Guardamos las métricas que cambiarán en vivo
  const [liveStats, setLiveStats] = useState({
    wellbeing: 72,
    streak: 0,
    aiStatus: "Activa"
  });
  const [lastRecord, setLastRecord] = useState(null); // Guarda el último registro emocional

  useEffect(() => {
     if (!userId) return;

    // 1. ESCUCHADOR DEL PERFIL (Racha y Bienestar)
    // Se dispara automáticamente si cambian los datos del usuario en Firebase
     const userRef = doc(db, "usuarios", userId);
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
    // Obtener registros sin orderBy para evitar requerir índices
    // Luego ordenamos en el cliente
    const recordsQuery = query(
      collection(db, "registros_emocionales"),
       where("uidUsuario", "==", userId)
    );

    const unsubRecords = onSnapshot(recordsQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Ordenar en el cliente por fecha descendente (más reciente primero)
        const records = snapshot.docs.map(doc => doc.data());
        records.sort((a, b) => {
          const timeA = a.fecha?.toDate ? a.fecha.toDate().getTime() : new Date(a.fecha || 0).getTime();
          const timeB = b.fecha?.toDate ? b.fecha.toDate().getTime() : new Date(b.fecha || 0).getTime();
          return timeB - timeA;
        });
        setLastRecord(records[0]);
      } else {
        setLastRecord(null);
      }
    });

    // Limpieza: Cerramos las conexiones cuando el usuario sale del Dashboard
    return () => {
      unsubUser();
      unsubRecords();
    };
  }, [userId]);

  // ==================== LÓGICA DE SALUDO ====================
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12
    ? t.morning
    : hour >= 12 && hour < 18
      ? t.afternoon
      : t.evening;

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
  const hasTodayRecord = lastRecord?.fecha === localDateKey();

  return (
    <MainLayout>
      <div className="dashboard-wrapper">
        
        <div className="dashboard-topbar">
           <button
             className="topbar-profile"
             type="button"
             onClick={() => navigate("/profile")}
             aria-label={language === "es" ? "Abrir perfil" : "Open profile"}
           >
             <div className="topbar-avatar">
               {profilePhoto ? <img src={profilePhoto} alt="Perfil" /> : <FaUserCircle aria-hidden="true" />}
             </div>
             <span className="topbar-name">{userName}</span>
             <FaChevronDown className="topbar-arrow" aria-hidden="true" />
           </button>
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
               <button
                 type="button"
                 className="record-link-btn"
                 onClick={() => navigate("/mood")}
               >
                 {hasTodayRecord
                   ? (language === "es" ? "Actualizar" : "Update")
                   : (language === "es" ? "Registrar hoy" : "Log today")}
                 <FaArrowRight aria-hidden="true" />
               </button>
             </div>
             <p className="record-desc">{t.lastRecordDesc}</p>
             <p className={`record-checkin-status ${hasTodayRecord ? "is-complete" : "is-pending"}`}>
               <span aria-hidden="true" />
               {hasTodayRecord
                 ? (language === "es" ? "Tu check-in de hoy está guardado." : "Today's check-in is saved.")
                 : (language === "es" ? "Un minuto para registrar cómo te sientes." : "Take a minute to log how you feel.")}
             </p>
            
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

export default Dashboard;
