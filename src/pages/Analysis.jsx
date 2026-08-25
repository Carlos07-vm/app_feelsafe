import "../styles/Analysis.css";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { obtenerRecomendaciones } from "../services/recomendacionService";
import { 
  FaBrain, 
  FaCheckCircle, 
  FaHeart, 
  FaRobot,
  FaLightbulb
} from "react-icons/fa";

function Analysis() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarRecomendaciones = async () => {
      try {
        setCargando(true);
        const resultado = await obtenerRecomendaciones();

        if (!resultado.success) {
          throw new Error(resultado.error);
        }

        setRecomendaciones(resultado.data);
        console.log("Recomendaciones cargadas:", resultado.data);
      } catch (err) {
        console.error("Error al cargar recomendaciones:", err);
        setError("No se pudieron cargar las recomendaciones.");
      } finally {
        setCargando(false);
      }
    };

    cargarRecomendaciones();
  }, []);

  return (
    <MainLayout>
      <div className="analysis-container">

        {/* ENCABEZADO */}
        <div className="analysis-header">
          <h1 className="page-title">
            <FaBrain className="title-icon" /> Análisis Emocional
          </h1>
          <p>Revisa tu estado actual y descubre consejos para mejorar tu día.</p>
        </div>

        {/* GRID PRINCIPAL (3 Tarjetas) */}
        <div className="analysis-grid">

          {/* TARJETA 1: ESTADO GENERAL */}
          <div className="analysis-card card-green">
            <div className="analysis-icon-wrapper">
              <FaCheckCircle className="analysis-icon" />
            </div>
            <div className="analysis-content">
              <h2>Estado General</h2>
              <h3>Estable</h3>
              <p>No se detectan riesgos emocionales importantes.</p>
            </div>
          </div>

          {/* TARJETA 2: BIENESTAR */}
          <div className="analysis-card card-purple">
            <div className="analysis-icon-wrapper">
              <FaHeart className="analysis-icon" />
            </div>
            <div className="analysis-content">
              <h2>Bienestar</h2>
              <h3>88%</h3>
              <p>Tu bienestar emocional se encuentra en un nivel saludable.</p>
            </div>
          </div>

          {/* TARJETA 3: IA RECOMIENDA */}
          <div className="analysis-card card-blue">
            <div className="analysis-icon-wrapper">
              <FaRobot className="analysis-icon" />
            </div>
            <div className="analysis-content">
              <h2>IA Recomienda</h2>
              
              {cargando && <p className="loading-text">Cargando recomendación...</p>}
              {error && <p className="error-text">{error}</p>}
              
              {!cargando && !error && recomendaciones.length === 0 && (
                <p>No hay recomendaciones disponibles en este momento.</p>
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
              <FaLightbulb className="section-icon text-yellow" /> Más Recomendaciones
            </h2>

            <div className="recommendations-grid">
              {/* Usamos slice(1) para no repetir la recomendación que ya sale arriba */}
              {recomendaciones.slice(1).map((recomendacion) => (
                <div className="recommendation-card" key={recomendacion.id}>
                  <div className="recommendation-content">
                    <h3>{recomendacion.titulo}</h3>
                    <p>{recomendacion.descripcion}</p>
                  </div>
                  <div className="recommendation-footer">
                    <span className="category-badge">
                      Categoría: {recomendacion.categoria}
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