import Sidebar from "../components/Sidebar";
import {
  FaSpa,
  FaMusic,
  FaQuoteLeft,
  FaHeartbeat,
} from "react-icons/fa";

function Resources() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <h1 className="page-title">
          🌿 Centro de Bienestar
        </h1>

        <div className="wellness-grid">

          <div className="wellness-card">
            <FaSpa className="wellness-icon" />
            <h3>Meditación Guiada</h3>
            <p>
              Relaja tu mente y mejora tu concentración.
            </p>
            <button>Comenzar</button>
          </div>

          <div className="wellness-card">
            <FaHeartbeat className="wellness-icon" />
            <h3>Respiración 4-4-4</h3>
            <p>
              Reduce estrés y ansiedad en pocos minutos.
            </p>
            <button>Practicar</button>
          </div>

          <div className="wellness-card">
            <FaMusic className="wellness-icon" />
            <h3>Música Relajante</h3>
            <p>
              Sonidos diseñados para mejorar tu bienestar.
            </p>
            <button>Escuchar</button>
          </div>

          <div className="wellness-card">
            <FaQuoteLeft className="wellness-icon" />
            <h3>Frase Motivacional</h3>
            <p>
              Cada día es una nueva oportunidad para crecer.
            </p>
            <button>Actualizar</button>
          </div>

        </div>

        <div className="challenge-card">

          <h2>🎯 Reto del Día</h2>

          <p>
            Escribe tres cosas por las que te sientes agradecido hoy.
          </p>

        </div>

      </main>
    </div>
  );
}

export default Resources;