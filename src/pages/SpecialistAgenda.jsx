import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistAgenda.css";

function SpecialistAgenda() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          navigate("/specialist/login", {
            replace: true,
          });

          return;
        }

        setCurrentUser(user);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // CARGAR AGENDA
  // =====================================================

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    setLoading(true);

    const appointmentsRef = collection(
      db,
      "citas_especialistas"
    );

    const appointmentsQuery = query(
      appointmentsRef,
      where(
        "especialistaId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (appointmentDoc) => ({
            id: appointmentDoc.id,
            ...appointmentDoc.data(),
          })
        );

        data.sort((a, b) => {
          const dateA = `${a.fecha || ""} ${a.hora || ""}`;
          const dateB = `${b.fecha || ""} ${b.hora || ""}`;

          return dateA.localeCompare(dateB);
        });

        setAppointments(data);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "Error cargando agenda:",
          firebaseError
        );

        setError(
          firebaseError.message ||
            "No se pudo cargar la agenda."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // CAMBIAR FORMULARIO
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =====================================================
  // CREAR CITA
  // =====================================================

  const handleCreateAppointment = async (
    event
  ) => {
    event.preventDefault();

    if (!currentUser?.uid) {
      return;
    }

    if (
      !form.usuarioNombre.trim() ||
      !form.fecha ||
      !form.hora
    ) {
      setError(
        "Completa el usuario, la fecha y la hora."
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await addDoc(
        collection(
          db,
          "citas_especialistas"
        ),
        {
          especialistaId:
            currentUser.uid,

          usuarioId:
            form.usuarioId.trim() || null,

          usuarioNombre:
            form.usuarioNombre.trim(),

          fecha: form.fecha,

          hora: form.hora,

          motivo:
            form.motivo.trim(),

          notas:
            form.notas.trim(),

          estado: "pendiente",

          creadoEn:
            serverTimestamp(),
        }
      );

      setForm({
        usuarioNombre: "",
        usuarioId: "",
        fecha: "",
        hora: "",
        motivo: "",
        notas: "",
      });

      setShowForm(false);

      setMessage(
        "Cita creada correctamente."
      );
    } catch (firebaseError) {
      console.error(
        "Error creando cita:",
        firebaseError
      );

      setError(
        firebaseError.message ||
          "No se pudo crear la cita."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // FECHA ACTUAL
  // =====================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =====================================================
  // PRÓXIMAS CITAS
  // =====================================================

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.fecha >= today &&
        appointment.estado !== "cancelada"
    );
  }, [appointments, today]);

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString("es-NI", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="specialist-agenda-loading">
        <div>⏳</div>

        <h2>
          Cargando agenda...
        </h2>

        <p>
          Estamos preparando tus citas.
        </p>
      </div>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-agenda-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="specialist-agenda-header">

        <div>

          <button
            type="button"
            className="agenda-back-button"
            onClick={() =>
              navigate(
                "/specialist/dashboard"
              )
            }
          >
            ← Volver al panel
          </button>

          <span className="agenda-label">
            PANEL DE PROFESIONALES
          </span>

          <h1>
            📅 Mi agenda
          </h1>

          <p>
            Organiza y consulta tus citas con
            los usuarios.
          </p>

        </div>

        <button
          type="button"
          className="new-appointment-button"
          onClick={() => {
            setShowForm(
              (previous) => !previous
            );

            setError("");
            setMessage("");
          }}
        >
          {showForm
            ? "✕ Cerrar"
            : "+ Nueva cita"}
        </button>

      </header>

      {/* =================================================
          MENSAJES
      ================================================= */}

      {message && (
        <div className="agenda-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="agenda-error">
          ⚠️ {error}
        </div>
      )}

      {/* =================================================
          FORMULARIO
      ================================================= */}

      {showForm && (
        <section className="appointment-form-card">

          <div className="agenda-section-title">
            <span>
              NUEVA CONSULTA
            </span>

            <h2>
              Programar cita
            </h2>
          </div>

          <form
            onSubmit={
              handleCreateAppointment
            }
          >

            <div className="appointment-form-grid">

              <div className="agenda-field">

                <label>
                  Nombre del usuario *
                </label>

                <input
                  type="text"
                  name="usuarioNombre"
                  value={
                    form.usuarioNombre
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Nombre del usuario"
                />

              </div>

              <div className="agenda-field">

                <label>
                  ID del usuario
                </label>

                <input
                  type="text"
                  name="usuarioId"
                  value={
                    form.usuarioId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Opcional"
                />

              </div>

              <div className="agenda-field">

                <label>
                  Fecha *
                </label>

                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  min={today}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="agenda-field">

                <label>
                  Hora *
                </label>

                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="agenda-field agenda-field-full">

                <label>
                  Motivo de la consulta
                </label>

                <input
                  type="text"
                  name="motivo"
                  value={form.motivo}
                  onChange={
                    handleChange
                  }
                  placeholder="Motivo de la cita"
                />

              </div>

              <div className="agenda-field agenda-field-full">

                <label>
                  Notas
                </label>

                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={
                    handleChange
                  }
                  rows="4"
                  placeholder="Notas adicionales..."
                />

              </div>

            </div>

            <div className="appointment-form-actions">

              <button
                type="button"
                className="agenda-cancel"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="agenda-save"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Crear cita"}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =================================================
          ESTADÍSTICAS
      ================================================= */}

      <section className="agenda-stats">

        <div className="agenda-stat-card">

          <span>📅</span>

          <div>
            <small>
              Total de citas
            </small>

            <strong>
              {appointments.length}
            </strong>
          </div>

        </div>

        <div className="agenda-stat-card">

          <span>⏰</span>

          <div>
            <small>
              Próximas
            </small>

            <strong>
              {upcomingAppointments.length}
            </strong>
          </div>

        </div>

        <div className="agenda-stat-card">

          <span>👥</span>

          <div>
            <small>
              Usuarios
            </small>

            <strong>
              {
                new Set(
                  appointments
                    .map(
                      (item) =>
                        item.usuarioId ||
                        item.usuarioNombre
                    )
                ).size
              }
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          LISTA
      ================================================= */}

      <section className="appointments-section">

        <div className="agenda-section-title">

          <span>
            ACTIVIDAD
          </span>

          <h2>
            Próximas citas
          </h2>

        </div>

        {upcomingAppointments.length ===
        0 ? (

          <div className="agenda-empty">

            <div>
              📅
            </div>

            <h3>
              No tienes citas programadas
            </h3>

            <p>
              Las nuevas citas aparecerán
              automáticamente aquí.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Programar una cita
            </button>

          </div>

        ) : (

          <div className="appointments-list">

            {upcomingAppointments.map(
              (appointment) => (

                <article
                  key={
                    appointment.id
                  }
                  className="appointment-card"
                >

                  <div className="appointment-date">

                    <strong>
                      {new Date(
                        `${appointment.fecha}T00:00:00`
                      ).getDate()}
                    </strong>

                    <span>
                      {new Date(
                        `${appointment.fecha}T00:00:00`
                      ).toLocaleDateString(
                        "es-NI",
                        {
                          month: "short",
                        }
                      )}
                    </span>

                  </div>

                  <div className="appointment-info">

                    <h3>
                      {
                        appointment.usuarioNombre ||
                        "Usuario"
                      }
                    </h3>

                    <p>
                      🕐{" "}
                      {appointment.hora}
                    </p>

                    {appointment.motivo && (
                      <span>
                        {appointment.motivo}
                      </span>
                    )}

                    <small>
                      {formatDate(
                        appointment.fecha
                      )}
                    </small>

                  </div>

                  <div className="appointment-status">
                    {appointment.estado ||
                      "pendiente"}
                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default SpecialistAgenda;