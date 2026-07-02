import MainLayout from "../layouts/MainLayout";

function Analysis() {
  return (
    <MainLayout>
      <div className="analysis-page">
        <h1 className="page-title">🧠 Análisis Emocional</h1>

        <div className="analysis-grid">
          <div className="analysis-card green">
            <h2>🟢 Estado General</h2>
            <h3>Estable</h3>
            <p>No se detectan riesgos emocionales importantes.</p>
          </div>

          <div className="analysis-card purple">
            <h2>💜 Bienestar</h2>
            <h3>88%</h3>
            <p>Tu bienestar emocional se encuentra en un nivel saludable.</p>
          </div>

          <div className="analysis-card blue">
            <h2>🤖 IA</h2>
            <h3>Recomendación</h3>
            <p>Continúa registrando tus emociones diariamente.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Analysis;
