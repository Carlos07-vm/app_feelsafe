import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaClock,
  FaUser,
  FaCheck,
  FaTimes,
  FaComments,
  FaCheckCircle,
  FaNotesMedical,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import SpecialistLayout from "../components/SpecialistLayout";
import "../styles/SpecialistAgenda.css";

function SpecialistAgenda() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // "all", "pending", "completed"

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    usuarioNombre: "",
    usuarioId: "",
    fecha: "",
    hora: "",
    motivo: "",
    notas: "",
  });

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
  // 2. PREFILL DESDE OTRA PÁGINA (ej. Directorio)
  // =====================================================
  useEffect(() => {
    if (location.state?.prefillUser) {
      setForm((prev) => ({
        ...prev,
        usuarioNombre: location.state.prefillUser.nombre || "",
        usuarioId: location.state.prefillUser.id || "",
      }));
      setShowForm(true);
    }
  }, [location.state]);

  // =====================================================
  // 3. ESCUCHAR CITAS EN TIEMPO REAL
  // =====================================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);

    const appointmentsRef = collection(db, "citas_especialistas");
    const appointmentsQuery = query(
      appointmentsRef,
      where("especialistaId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        data.sort((a, b) => {
          const keyA = `${a.fecha || ""} ${a.hora || ""}`;
          const keyB = `${b.fecha || ""} ${b.hora || ""}`;
          return keyA.localeCompare(keyB);
        });

        setAppointments(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando agenda:", err);
        setError("No se pudieron cargar las citas.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // CREAR CITA
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.usuarioNombre.trim() || !form.fecha || !form.hora) {
      setError("Por favor completa el nombre del paciente, fecha y hora.");
      return;
    }

    try {
      setSaving(true);

      const appointmentsRef = collection(db, "citas_especialistas");
      await addDoc(appointmentsRef, {
        especialistaId: currentUser.uid,
        usuarioNombre: form.usuarioNombre.trim(),
        usuarioId: form.usuarioId.trim() || null,
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo.trim() || "Consulta de bienestar",
        notas: form.notas.trim() || "",
        estado: "Pendiente",
        creadoEn: serverTimestamp(),
      });

      setMessage("Cita agendada correctamente.");
      setForm({
        usuarioNombre: "",
        usuarioId: "",
        fecha: "",
        hora: "",
        motivo: "",
        notas: "",
      });
      setShowForm(false);
   } catch (err) {
      console.error("❌ ERROR COMPLETO AL CREAR CITA:", err);
      console.error("Código:", err?.code);
      console.error("Mensaje:", err?.message);
      console.error("Usuario actual:", currentUser);
      console.error("UID especialista:", currentUser?.uid);
      console.error("Datos de la cita:", {
        especialistaId: currentUser?.uid,
        usuarioNombre: form.usuarioNombre.trim(),
        usuarioId: form.usuarioId.trim() || null,
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo.trim() || "Consulta de bienestar",
        notas: form.notas.trim() || "",
      });

      setError(
        err?.code
          ? `No se pudo programar la cita: ${err.code}`
          : "No se pudo programar la cita."
      );
}
     finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ACTUALIZAR ESTADO DE CITA
  // =====================================================
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const docRef = doc(db, "citas_especialistas", appointmentId);
      await updateDoc(docRef, { estado: newStatus });
      setMessage(`Cita marcada como "${newStatus}".`);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      setError("No se pudo actualizar el estado de la cita.");
    }
  };

  // =====================================================
  // FILTRADO DE CITAS
  // =====================================================
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filterTab === "pending") return apt.estado !== "Completada" && apt.estado !== "Cancelada";
      if (filterTab === "completed") return apt.estado === "Completada";
      return true;
    });
  }, [appointments, filterTab]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.fecha === todayStr);
  }, [appointments, todayStr]);

  const pendingCount = useMemo(() => {
    return appointments.filter((apt) => apt.estado !== "Completada" && apt.estado !== "Cancelada").length;
  }, [appointments]);

  return (
    <SpecialistLayout>
      <div className="specialist-agenda-wrapper">
        {/* ===================================================
            HEADER DE AGENDA
            =================================================== */}
        <header className="agenda-page-header">
          <div>
            <div className="agenda-page-badge">
              <span>Gestión de Citas</span>
            </div>
            <h1 className="agenda-page-title">Mi Agenda de Consultas</h1>
            <p className="agenda-page-subtitle">
              Organiza, programa y lleva el control de las sesiones con tus pacientes.
            </p>
          </div>

          <button
            type="button"
            className="agenda-new-btn"
            onClick={() => {
              setShowForm((prev) => !prev);
              setError("");
              setMessage("");
            }}
          >
            {showForm ? <FaTimes /> : <FaCalendarPlus />}
            <span>{showForm ? "Cerrar Formulario" : "Nueva Cita"}</span>
          </button>
        </header>

        {/* FEEDBACK BANNERS */}
        {message && (
          <div className="agenda-alert success">
            <FaCheckCircle /> {message}
          </div>
        )}
        {error && (
          <div className="agenda-alert error">
            <FaTimes /> {error}
          </div>
        )}

        {/* ===================================================
            FORMULARIO NUEVA CITA (DESPLEGABLE)
            =================================================== */}
        {showForm && (
          <section className="agenda-form-card">
            <div className="agenda-form-header">
              <FaCalendarPlus className="agenda-form-icon" />
              <div>
                <h2>Programar Nueva Consulta</h2>
                <p>Ingresa los detalles para agendar la sesión con el paciente.</p>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment}>
              <div className="agenda-form-grid">
                <div className="agenda-field">
                  <label>Nombre del Paciente *</label>
                  <input
                    type="text"
                    name="usuarioNombre"
                    value={form.usuarioNombre}
                    onChange={handleChange}
                    placeholder="Ej. Carlos Martínez"
                    required
                  />
                </div>

                <div className="agenda-field">
                  <label>ID de Usuario (Opcional)</label>
                  <input
                    type="text"
                    name="usuarioId"
                    value={form.usuarioId}
                    onChange={handleChange}
                    placeholder="ID del usuario en FeelSafe"
                  />
                </div>

                <div className="agenda-field">
                  <label>Fecha de la Cita *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    min={todayStr}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="agenda-field">
                  <label>Hora *</label>
                  <input
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="agenda-field full-width">
                  <label>Motivo de Consulta</label>
                  <input
                    type="text"
                    name="motivo"
                    value={form.motivo}
                    onChange={handleChange}
                    placeholder="Ej. Sesión de manejo de ansiedad, seguimiento mensual..."
                  />
                </div>

                <div className="agenda-field full-width">
                  <label>Notas Privadas del Especialista</label>
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={handleChange}
                    placeholder="Detalles clínicos o preparativos de la sesión..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="agenda-form-actions">
                <button
                  type="button"
                  className="agenda-btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="agenda-btn-submit"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Confirmar y Agendar"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ===================================================
            RESUMEN DE MÉTRICAS RÁPIDAS
            =================================================== */}
        <section className="agenda-stats-bar">
          <div className="agenda-stat-pill">
            <span>Citas Hoy:</span>
            <strong>{todayAppointments.length}</strong>
          </div>
          <div className="agenda-stat-pill">
            <span>Pendientes:</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="agenda-stat-pill">
            <span>Total Histórico:</span>
            <strong>{appointments.length}</strong>
          </div>
        </section>

        {/* ===================================================
            TABS Y LISTA DE CITAS
            =================================================== */}
        <div className="agenda-tabs-bar">
          <button
            type="button"
            className={`agenda-tab ${filterTab === "all" ? "active" : ""}`}
            onClick={() => setFilterTab("all")}
          >
            Todas ({appointments.length})
          </button>
          <button
            type="button"
            className={`agenda-tab ${filterTab === "pending" ? "active" : ""}`}
            onClick={() => setFilterTab("pending")}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            className={`agenda-tab ${filterTab === "completed" ? "active" : ""}`}
            onClick={() => setFilterTab("completed")}
          >
            Completadas ({appointments.filter((a) => a.estado === "Completada").length})
          </button>
        </div>

        <main className="agenda-content-area">
          {loading ? (
            <div className="agenda-loading-box">
              <div className="specialist-spinner"></div>
              <p>Cargando citas de la agenda...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="agenda-empty-box">
              <div className="agenda-empty-icon">
                <FaCalendarAlt />
              </div>
              <h3>No hay citas en este listado</h3>
              <p>
                {filterTab === "pending"
                  ? "No tienes consultas pendientes. ¡Estás al día!"
                  : "Usa el botón '+ Nueva Cita' para programar una nueva sesión."}
              </p>
            </div>
          ) : (
            <div className="agenda-cards-grid">
              {filteredAppointments.map((apt) => {
                const isCompleted = apt.estado === "Completada";
                const isCancelled = apt.estado === "Cancelada";

                return (
                  <article
                    key={apt.id}
                    className={`appointment-card ${
                      isCompleted ? "completed" : isCancelled ? "cancelled" : "pending"
                    }`}
                  >
                    <div className="appointment-card-top">
                      <div className="apt-user-group">
                        <div className="apt-user-avatar">
                          <FaUser />
                        </div>
                        <div>
                          <h3 className="apt-user-name">{apt.usuarioNombre}</h3>
                          <span className="apt-reason">{apt.motivo}</span>
                        </div>
                      </div>

                      <span
                        className={`apt-status-chip ${
                          isCompleted
                            ? "chip-completed"
                            : isCancelled
                            ? "chip-cancelled"
                            : "chip-pending"
                        }`}
                      >
                        {apt.estado || "Pendiente"}
                      </span>
                    </div>

                    <div className="appointment-datetime-row">
                      <div className="apt-date-badge">
                        <FaCalendarAlt /> <span>{apt.fecha}</span>
                      </div>
                      <div className="apt-time-badge">
                        <FaClock /> <span>{apt.hora}</span>
                      </div>
                    </div>

                    {apt.notas && (
                      <div className="apt-notes-box">
                        <FaNotesMedical className="notes-icon" />
                        <p>{apt.notas}</p>
                      </div>
                    )}

                    <div className="appointment-card-actions">
                      {!isCompleted && !isCancelled && (
                        <button
                          type="button"
                          className="apt-btn-complete"
                          onClick={() => handleUpdateStatus(apt.id, "Completada")}
                        >
                          <FaCheck /> Marcar Realizada
                        </button>
                      )}
                      {!isCompleted && !isCancelled && (
                        <button
                          type="button"
                          className="apt-btn-cancel-apt"
                          onClick={() => handleUpdateStatus(apt.id, "Cancelada")}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      )}
                      {isCompleted && (
                        <span className="apt-done-label">
                          ✓ Consulta realizada
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistAgenda;
