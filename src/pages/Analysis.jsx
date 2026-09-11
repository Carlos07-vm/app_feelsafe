import "../styles/Analysis.css";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import {
  FaBrain,
  FaCheckCircle,
  FaHeart,
  FaRobot,
  FaLightbulb,
  FaExclamationTriangle,
} from "react-icons/fa";

function Analysis() {
  const { language, user } = useApp();
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Bienestar en tiempo real
  const wellbeing = user?.wellbeing ?? 72;

  // 1. Escuchar recomendaciones en tiempo real desde Firestore
  useEffect(() => {
    const recRef = collection(db, "recursos");
    const recQuery = query(
      recRef,
      where("estado", "==", "Activo"),
      limit(6)
    );

    const unsubscribe = onSnapshot(
      recQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docsData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setRecomendaciones(docsData);
        } else {
          // Fallback enriquecido si no hay en base de datos
          setRecomendaciones([
            {
              id: "rec-1",
              titulo: "Pausa Consciente de 3 Minutos",
              descripcion: "Dedica 3 minutos a cerrar los ojos y enfocarte únicamente en el flujo de tu respiración para reiniciar tu mente.",
              categoria: "Mindfulness",
            },
            {
              id: "rec-2",
              titulo: "Caminata y Luz Solar",
              descripcion: "Una caminata de 15 minutos al aire libre aumenta la producción de serotonina y disminuye la hormona del estrés.",
              categoria: "Bienestar Físico",
            },
            {
              id: "rec-3",
              titulo: "Desconexión Digital Nocturna",
              descripcion: "Apaga o aleja las pantallas 30 minutos antes de dormir para mejorar la calidad del sueño profundo.",
              categoria: "Descanso",
            },
          ]);
        }
        setError("");
        setCargando(false);
      },
      (err) => {
        console.error("Error escuchando recomendaciones:", err);
        setError("No se pudieron cargar las recomendaciones en este momento.");
        // Fallback enriquecido
        setRecomendaciones([
          {
            id: "rec-1",
            titulo: "Pausa Consciente de 3 Minutos",
            descripcion: "Dedica 3 minutos a cerrar los ojos y enfocarte únicamente en el flujo de tu respiración para reiniciar tu mente.",
            categoria: "Mindfulness",
          },
        ]);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Cálculo dinámico del estado general
  const getGeneralStatus = () => {
    if (wellbeing >= 70) {
      return {
        label: language === "es" ? "Estable" : "Stable",
        desc: language === "es"
          ? "No se detectan riesgos emocionales importantes. Tu ritmo es saludable."
          : "No significant emotional risks detected. Your pace is healthy.",
        colorClass: "card-green",
        icon: <FaCheckCircle className="analysis-icon" />,
      };
    } else if (wellbeing >= 40) {
      return {
        label: language === "es" ? "Atento" : "Attentive",
        desc: language === "es"
          ? "Se observan fluctuaciones emocionales. Te sugerimos practicar respiración guiada."
          : "Some emotional fluctuations observed. Guided breathing is recommended.",
        colorClass: "card-orange",
        icon: <FaExclamationTriangle className="analysis-icon" />,
      };
    } else {
      return {
        label: language === "es" ? "Requiere Apoyo" : "Needs Support",
        desc: language === "es"
          ? "Niveles bajos detectados. Te recomendamos consultar con un especialista o acudir al Centro SOS."
          : "Low wellbeing detected. We recommend reaching out to a specialist or SOS Center.",
        colorClass: "card-red",
        icon: <FaExclamationTriangle className="analysis-icon" />,
      };
    }
  };

  const generalStatus = getGeneralStatus();

  return (
    <MainLayout>
      <div className="analysis-container">
        {/* ENCABEZADO */}
        <div className="analysis-header">
          <h1 className="page-title">
            <FaBrain className="title-icon" /> {language === "es" ? "Análisis Emocional en Tiempo Real" : "Real-Time Emotional Analysis"}
          </h1>
          <p>
            {language === "es"
              ? "Monitoreo en vivo de tu equilibrio emocional, tendencias y recomendaciones personalizadas."
              : "Live monitoring of your emotional balance, trends, and personalized recommendations."}
          </p>
        </div>

        {/* GRID PRINCIPAL (3 Tarjetas) */}
        <div className="analysis-grid">
          {/* TARJETA 1: ESTADO GENERAL */}
          <div className={`analysis-card ${generalStatus.colorClass}`}>
            <div className="analysis-icon-wrapper">{generalStatus.icon}</div>
            <div className="analysis-content">
              <h2>{language === "es" ? "Estado General" : "General Status"}</h2>
              <h3>{generalStatus.label}</h3>
              <p>{generalStatus.desc}</p>
            </div>
          </div>

          {/* TARJETA 2: BIENESTAR EN TIEMPO REAL */}
          <div className="analysis-card card-purple">
            <div className="analysis-icon-wrapper">
              <FaHeart className="analysis-icon" />
            </div>
            <div className="analysis-content">
              <h2>{language === "es" ? "Bienestar Actual" : "Current Wellbeing"}</h2>
              <h3>{wellbeing}%</h3>
              <p>
                {wellbeing >= 70
                  ? language === "es"
                    ? "Tu bienestar emocional se encuentra en un nivel óptimo."
                    : "Your emotional wellbeing is at an optimal level."
                  : language === "es"
                  ? "Recuerda cuidar tus horas de descanso y practicar pausas activas."
                  : "Remember to take care of your rest and practice mindful breaks."}
              </p>
            </div>
          </div>

          {/* TARJETA 3: IA RECOMIENDA */}
          <div className="analysis-card card-blue">
            <div className="analysis-icon-wrapper">
              <FaRobot className="analysis-icon" />
            </div>
            <div className="analysis-content">
              <h2>{language === "es" ? "IA Recomienda" : "AI Recommends"}</h2>

              {cargando && (
                <p className="loading-text">
                  {language === "es" ? "Cargando recomendación..." : "Loading recommendation..."}
                </p>
              )}
              {error && <p className="error-text">{error}</p>}

              {!cargando && !error && recomendaciones.length === 0 && (
                <p>
                  {language === "es"
                    ? "No hay recomendaciones disponibles en este momento."
                    : "No recommendations available right now."}
                </p>
              )}

              {!cargando && !error && recomendaciones.length > 0 && (
                <>
                  <h3>{recomendaciones[0].titulo}</h3>
                  <p>{recomendaciones[0].descripcion}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* LISTA DE RECOMENDACIONES EXTRA */}
        {!cargando && !error && recomendaciones.length > 1 && (
          <div className="recommendations-section">
            <h2 className="section-title">
              <FaLightbulb className="section-icon text-yellow" />{" "}
              {language === "es" ? "Más Recomendaciones de Bienestar" : "More Wellness Recommendations"}
            </h2>

            <div className="recommendations-grid">
              {recomendaciones.slice(1).map((recomendacion) => (
                <div className="recommendation-card" key={recomendacion.id}>
                  <div className="recommendation-content">
                    <h3>{recomendacion.titulo}</h3>
                    <p>{recomendacion.descripcion}</p>
                  </div>
                  <div className="recommendation-footer">
                    <span className="category-badge">
                      {language === "es" ? "Categoría: " : "Category: "}
                      {recomendacion.categoria || "Bienestar"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Analysis;
