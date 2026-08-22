import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistSettings.css";

function SpecialistSettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [specialist, setSpecialist] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [available, setAvailable] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          navigate("/specialist/login", {
            replace: true,
          });

          return;
        }

        setUser(firebaseUser);

        try {
          const specialistRef = doc(
            db,
            "specialists",
            firebaseUser.uid
          );

          const specialistSnap =
            await getDoc(specialistRef);

          if (!specialistSnap.exists()) {
            setError(
              "No se encontró tu perfil."
            );

            setLoading(false);
            return;
          }

          const data =
            specialistSnap.data();

          setSpecialist(data);

          setAvailable(
            data.disponible !== false
          );

          setNotifications(
            data.notificaciones !== false
          );
        } catch (err) {
          console.error(
            "Error cargando configuración:",
            err
          );

          setError(
            "No se pudo cargar la configuración."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // ACTUALIZAR DISPONIBILIDAD
  // =====================================================

  const handleAvailability = async (
    value
  ) => {
    if (!user?.uid) {
      return;
    }

    setAvailable(value);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateDoc(
        doc(db, "specialists", user.uid),
        {
          disponible: value,
        }
      );

      setMessage(
        value
          ? "Ahora apareces como disponible."
          : "Ahora apareces como no disponible."
      );
    } catch (err) {
      console.error(err);

      setAvailable(!value);

      setError(
        "No se pudo actualizar tu disponibilidad."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ACTUALIZAR NOTIFICACIONES
  // =====================================================

  const handleNotifications = async (
    value
  ) => {
    if (!user?.uid) {
      return;
    }

    setNotifications(value);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateDoc(
        doc(db, "specialists", user.uid),
        {
          notificaciones: value,
        }
      );

      setMessage(
        value
          ? "Notificaciones activadas."
          : "Notificaciones desactivadas."
      );
    } catch (err) {
      console.error(err);

      setNotifications(!value);

      setError(
        "No se pudo actualizar las notificaciones."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/specialist/login", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Error cerrando sesión:",
        err
      );

      setError(
        "No se pudo cerrar la sesión."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="specialist-settings-loading">
        <div>⏳</div>

        <p>
          Cargando configuración...
        </p>
      </div>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-settings-page">

      <header className="specialist-settings-header">

        <div>

          <button
            className="settings-back-button"
            onClick={() =>
              navigate(
                "/specialist/dashboard"
              )
            }
          >
            ← Volver al panel
          </button>

          <span>
            PANEL DE PROFESIONALES
          </span>

          <h1>
            ⚙ Configuración
          </h1>

          <p>
            Administra las preferencias de tu
            cuenta profesional.
          </p>

        </div>

      </header>

      <main className="specialist-settings-content">

        {message && (
          <div className="settings-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="settings-error">
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            CUENTA
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              👤
            </div>

            <div>

              <span>
                CUENTA
              </span>

              <h2>
                Información de acceso
              </h2>

            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>
                Correo electrónico
              </strong>

              <small>
                Correo utilizado para iniciar
                sesión.
              </small>
            </div>

            <span className="settings-value">
              {user?.email}
            </span>

          </div>

          <div className="settings-row">

            <div>
              <strong>
                Tipo de cuenta
              </strong>

              <small>
                Perfil profesional FeelSafe.
              </small>
            </div>

            <span className="settings-badge">
              Especialista
            </span>

          </div>

        </section>

        {/* =================================================
            DISPONIBILIDAD
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🟢
            </div>

            <div>

              <span>
                DISPONIBILIDAD
              </span>

              <h2>
                Estado profesional
              </h2>

            </div>

          </div>

          <div className="settings-toggle-row">

            <div>

              <strong>
                Disponible para atender
              </strong>

              <small>
                Los usuarios podrán saber si
                estás disponible.
              </small>

            </div>

            <button
              type="button"
              className={`settings-switch ${
                available
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleAvailability(
                  !available
                )
              }
              disabled={saving}
              aria-label="Cambiar disponibilidad"
            >
              <span></span>
            </button>

          </div>

          <div
            className={`availability-message ${
              available
                ? "available"
                : "unavailable"
            }`}
          >
            {available
              ? "● Estás disponible para atender usuarios."
              : "● Actualmente apareces como no disponible."}
          </div>

        </section>

        {/* =================================================
            NOTIFICACIONES
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🔔
            </div>

            <div>

              <span>
                NOTIFICACIONES
              </span>

              <h2>
                Avisos
              </h2>

            </div>

          </div>

          <div className="settings-toggle-row">

            <div>

              <strong>
                Notificaciones
              </strong>

              <small>
                Recibir avisos relacionados
                con tus conversaciones.
              </small>

            </div>

            <button
              type="button"
              className={`settings-switch ${
                notifications
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotifications(
                  !notifications
                )
              }
              disabled={saving}
              aria-label="Cambiar notificaciones"
            >
              <span></span>
            </button>

          </div>

        </section>

        {/* =================================================
            PERFIL
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              ✏️
            </div>

            <div>

              <span>
                PERFIL
              </span>

              <h2>
                Información profesional
              </h2>

            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>
                Editar perfil
              </strong>

              <small>
                Cambia tu nombre, especialidad,
                descripción y foto.
              </small>
            </div>

            <button
              className="settings-action"
              onClick={() =>
                navigate(
                  "/specialist/profile"
                )
              }
            >
              Editar →
            </button>

          </div>

        </section>

        {/* =================================================
            SESIÓN
        ================================================= */}

        <section className="settings-card danger-card">

          <div className="settings-card-header">

            <div className="settings-card-icon danger">
              ↪
            </div>

            <div>

              <span>
                SESIÓN
              </span>

              <h2>
                Cerrar sesión
              </h2>

            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>
                Salir de FeelSafe
              </strong>

              <small>
                Tendrás que iniciar sesión
                nuevamente para acceder al
                panel.
              </small>
            </div>

            <button
              className="settings-logout"
              onClick={
                handleLogout
              }
            >
              Cerrar sesión
            </button>

          </div>

        </section>

        {saving && (
          <p className="settings-saving">
            Guardando cambios...
          </p>
        )}

      </main>
    </div>
  );
}

export default SpecialistSettings;