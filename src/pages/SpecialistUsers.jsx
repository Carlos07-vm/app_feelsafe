import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  FaUsers,
  FaSearch,
  FaComments,
  FaCalendarPlus,
  FaUserCircle,
  FaClock,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import SpecialistLayout from "../components/SpecialistLayout";
import "../styles/SpecialistUsers.css";

function SpecialistUsers() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // 1. AUTENTICACIÓN
  // =====================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // 2. CARGAR USUARIOS / PACIENTES
  // =====================================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    setError("");

    const conversationsRef = collection(db, "conversaciones_especialistas");
    const conversationsQuery = query(
      conversationsRef,
      where("especialistaId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      async (snapshot) => {
        try {
          const userMap = new Map();

          for (const convDoc of snapshot.docs) {
            const data = convDoc.data();
            const userId = data.usuarioId;
            if (!userId) continue;

            let usuarioNombre = data.usuarioNombre || "Usuario";
            let usuarioFoto = data.usuarioFoto || "";
            let usuarioCorreo = "";

            try {
              const userRef = doc(db, "usuarios", userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const realData = userSnap.data();
                usuarioNombre =
                  realData.displayName ||
                  realData.nombre ||
                  usuarioNombre;
                usuarioFoto =
                  realData.photoURL ||
                  realData.foto ||
                  usuarioFoto;
                usuarioCorreo =
                  realData.email ||
                  realData.correo ||
                  "";
              }
            } catch {
              // fallback
            }

            if (!userMap.has(userId)) {
              userMap.set(userId, {
                id: userId,
                conversationId: convDoc.id,
                conversation: { id: convDoc.id, ...data },
                usuarioNombre,
                usuarioFoto,
                usuarioCorreo,
                ultimoMensaje: data.ultimoMensaje || "Consulta iniciada",
                fechaUltimoMensaje: data.fechaUltimoMensaje,
                mensajesNoLeidos: data.mensajesNoLeidos || 0,
              });
            }
          }

          const uniqueUsers = Array.from(userMap.values());
          uniqueUsers.sort((a, b) => {
            const timeA = a.fechaUltimoMensaje?.toMillis ? a.fechaUltimoMensaje.toMillis() : 0;
            const timeB = b.fechaUltimoMensaje?.toMillis ? b.fechaUltimoMensaje.toMillis() : 0;
            return timeB - timeA;
          });

          setUsersList(uniqueUsers);
          setLoading(false);
        } catch (err) {
          console.error("Error cargando usuarios:", err);
          setError("No se pudieron cargar los pacientes.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error escuchando conversaciones:", err);
        setError("No se pudo conectar a la base de datos.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // BÚSQUEDA
  // =====================================================
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const term = search.toLowerCase();
      return (
        u.usuarioNombre.toLowerCase().includes(term) ||
        (u.usuarioCorreo && u.usuarioCorreo.toLowerCase().includes(term))
      );
    });
  }, [usersList, search]);

  const formatLastActivity = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== "function") return "";
    try {
      return timestamp.toDate().toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <SpecialistLayout>
      <div className="specialist-users-wrapper">
        {/* ===================================================
            HEADER
            =================================================== */}
        <header className="users-page-header">
          <div>
            <div className="users-page-badge">
              <span>Directorio Profesional</span>
            </div>
            <h1 className="users-page-title">Directorio de Pacientes</h1>
            <p className="users-page-subtitle">
              Consulta la información de las personas que han recibido orientación y acompañamiento contigo.
            </p>
          </div>

          <div className="users-stats-box">
            <div className="users-stat-num">{usersList.length}</div>
            <span className="users-stat-text">
              {usersList.length === 1 ? "Paciente Atendido" : "Pacientes Atendidos"}
            </span>
          </div>
        </header>

        {/* ===================================================
            TOOLBAR: BÚSQUEDA
            =================================================== */}
        <div className="users-toolbar">
          <div className="users-search-input-wrap">
            <FaSearch className="users-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo de paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="users-clear-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            LISTADO DE PACIENTES
            =================================================== */}
        <main className="users-content-area">
          {loading ? (
            <div className="users-loading-box">
              <div className="specialist-spinner"></div>
              <p>Cargando lista de pacientes...</p>
            </div>
          ) : error ? (
            <div className="users-empty-box">
              <p className="users-error-text">⚠️ {error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty-box">
              <div className="users-empty-icon">
                {search ? <FaSearch /> : <FaUsers />}
              </div>
              <h3>
                {search
                  ? "No encontramos pacientes con esa búsqueda"
                  : "Todavía no tienes pacientes registrados"}
              </h3>
              <p>
                {search
                  ? "Verifica la ortografía o intenta buscar con otro término."
                  : "Cuando los usuarios de FeelSafe inicien una conversación contigo, aparecerán en este directorio."}
              </p>
            </div>
          ) : (
            <div className="users-cards-grid">
              {filteredUsers.map((user) => (
                <article key={user.id} className="patient-card">
                  <div className="patient-card-header">
                    <div className="patient-avatar">
                      {user.usuarioFoto ? (
                        <img
                          src={user.usuarioFoto}
                          alt={user.usuarioNombre}
                        />
                      ) : (
                        <FaUserCircle className="patient-avatar-icon" />
                      )}
                    </div>
                    <div className="patient-info">
                      <h3 className="patient-name">{user.usuarioNombre}</h3>
                      {user.usuarioCorreo && (
                        <span className="patient-email">
                          {user.usuarioCorreo}
                        </span>
                      )}
                      <span className="patient-activity">
                        <FaClock /> Última interacción:{" "}
                        {formatLastActivity(user.fechaUltimoMensaje) || "Reciente"}
                      </span>
                    </div>
                  </div>

                  <div className="patient-last-msg">
                    <span className="last-msg-label">Último mensaje:</span>
                    <p className="last-msg-text">"{user.ultimoMensaje}"</p>
                  </div>

                  <div className="patient-card-actions">
                    <button
                      type="button"
                      className="patient-btn-chat"
                      onClick={() =>
                        navigate(`/specialist-chat/${user.conversationId}`, {
                          state: { conversation: user.conversation },
                        })
                      }
                    >
                      <FaComments /> Abrir Chat
                    </button>
                    <button
                      type="button"
                      className="patient-btn-agenda"
                      onClick={() =>
                        navigate("/specialist/agenda", {
                          state: {
                            prefillUser: {
                              id: user.id,
                              nombre: user.usuarioNombre,
                            },
                          },
                        })
                      }
                    >
                      <FaCalendarPlus /> Agendar Cita
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistUsers;