import MainLayout from "../layouts/MainLayout";
import {
  FaPhoneAlt,
  FaHeart,
  FaUserFriends,
  FaHandsHelping,
} from "react-icons/fa";

function SOS() {
  return (
    <MainLayout>

      <h1 className="page-title">
        🚨 Centro SOS
      </h1>

      <p className="page-description">
        Si estás pasando por un momento difícil, no estás solo.
        FeelSafe está aquí para ayudarte.
      </p>

      <div className="sos-grid">

        <div className="sos-card emergency">

          <FaPhoneAlt className="sos-icon"/>

          <h2>Llamar a un contacto</h2>

          <p>
            Contacta rápidamente a un familiar o persona de confianza.
          </p>

          <button>Contactar</button>

        </div>

        <div className="sos-card">

          <FaHeart className="sos-icon"/>

          <h2>Respira conmigo</h2>

          <p>
            Inicia un ejercicio guiado para disminuir la ansiedad.
          </p>

          <button>Comenzar</button>

        </div>

        <div className="sos-card">

          <FaUserFriends className="sos-icon"/>

          <h2>Habla con alguien</h2>

          <p>
            Compartir cómo te sientes puede ayudarte mucho.
          </p>

          <button>Ver recomendaciones</button>

        </div>

        <div className="sos-card">

          <FaHandsHelping className="sos-icon"/>

          <h2>Consejos rápidos</h2>

          <ul>
            <li>Respira lentamente.</li>
            <li>Bebe agua.</li>
            <li>Sal a caminar.</li>
            <li>Escucha música relajante.</li>
          </ul>

        </div>

      </div>

    </MainLayout>
  );
}

export default SOS;