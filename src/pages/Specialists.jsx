import MainLayout from "../layouts/MainLayout";
import specialists from "../constants/specialists";
import "../styles/Specialists.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Specialists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleStartChat = (specialist) => {
    navigate("/chat-room", {
      state: { specialist },
    });
  };
  const filteredSpecialists = specialists.filter((specialist) =>
  specialist.name.toLowerCase().includes(search.toLowerCase()) ||
  specialist.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="specialists-page">

        {/* ================= Encabezado ================= */}

        <div className="specialists-header">
          <h1>👩‍⚕️ Especialistas disponibles</h1>

          <p>
            Encuentra un profesional con quien hablar en un espacio seguro,
            confidencial y libre de juicios.
          </p>
        </div>

        {/* ================= Buscador ================= */}

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar especialista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= Lista de especialistas ================= */}

        <div className="specialists-grid">

          {filteredSpecialists.map((specialist) => (
            <div
              key={specialist.id}
              className="specialist-card"
            >

              <img
                src={specialist.photo}
                alt={specialist.name}
                className="specialist-photo"
              />

              <div className="specialist-info">

                <div className="specialist-top">

                  <h3>{specialist.name}</h3>

                  <span
                    className={`status ${
                      specialist.status === "Disponible"
                        ? "online"
                        : "offline"
                    }`}
                  >
                    {specialist.status}
                  </span>

                </div>

                <p className="specialty">
                  {specialist.specialty}
                </p>

                <p className="description">
                  {specialist.description}
                </p>

                <div className="card-footer">

                  <span className="rating">
                    ⭐ {specialist.rating}
                  </span>

                  <button
                    onClick={() => handleStartChat(specialist)}
                  >
                    Iniciar conversación
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </MainLayout>
  );
}

export default Specialists;