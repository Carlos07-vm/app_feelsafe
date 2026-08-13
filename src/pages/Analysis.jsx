import "../styles/Analysis.css";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { obtenerRecomendaciones } from "../services/recomendacionService";

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

        console.log(
          "Recomendaciones cargadas:",
          resultado.data
        );
      } catch (err) {
        console.error(
          "Error al cargar recomendaciones:",
          err
        );

        setError(
          "No se pudieron cargar las recomendaciones."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarRecomendaciones();
  }, []);

  return (
    <MainLayout>
      <div className="analysis-page">

        <h1 className="page-title">
          🧠 Análisis Emocional
        </h1>

        <div className="analysis-grid">

          <div className="analysis-card green">
            <h2>🟢 Estado General</h2>

            <h3>Estable</h3>

            <p>
              No se detectan riesgos emocionales importantes.
            </p>
          </div>

          <div className="analysis-card purple">
            <h2>💜 Bienestar</h2>

            <h3>88%</h3>

            <p>
              Tu bienestar emocional se encuentra en un
              nivel saludable.
            </p>
          </div>

          <div className="analysis-card blue">
            <h2>🤖 IA</h2>

            <h3>Recomendación</h3>

            {cargando && (
              <p>
                Cargando recomendación...
              </p>
            )}

            {error && (
              <p>
                {error}
              </p>
            )}

            {!cargando &&
              !error &&
              recomendaciones.length === 0 && (
                <p>
                  No hay recomendaciones disponibles.
                </p>
              )}

            {!cargando &&
              !error &&
              recomendaciones.length > 0 && (
                <div>
                  <p>
                    {recomendaciones[0].descripcion}
                  </p>

                  <strong>
                    {recomendaciones[0].titulo}
                  </strong>
                </div>
              )}
          </div>

        </div>

        {!cargando &&
          !error &&
          recomendaciones.length > 1 && (
            <div className="recommendations-list">

              <h2>
                Recomendaciones
              </h2>

              {recomendaciones.map(
                (recomendacion) => (
                  <div
                    className="analysis-card"
                    key={recomendacion.id}
                  >
                    <h3>
                      {recomendacion.titulo}
                    </h3>

                    <p>
                      {recomendacion.descripcion}
                    </p>

                    <small>
                      Categoría:{" "}
                      {recomendacion.categoria}
                    </small>

                  </div>
                )
              )}

            </div>
          )}

      </div>
    </MainLayout>
  );
}

export default Analysis;