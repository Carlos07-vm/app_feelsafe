import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import {
  FaUserCog,
  FaUserShield,
  FaToggleOn,
  FaToggleOff,
  FaBell,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimes,
  FaShieldAlt,
  FaEnvelope,
  FaCircle,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import SpecialistLayout from "../components/SpecialistLayout";
import "../styles/SpecialistSettings.css";

function SpecialistSettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [available, setAvailable] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // 1. AUTENTICACIÓN Y ESCUCHA EN TIEMPO REAL
  // =====================================================
  useEffect(() => {
    let unsubSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(firebaseUser);

      const specialistRef = doc(db, "specialists", firebaseUser.uid);
      unsubSnapshot = onSnapshot(
        specialistRef,
        (specialistSnap) => {
          if (specialistSnap.exists()) {
            const data = specialistSnap.data();
            setSpecialist(data);
            setAvailable(data.disponible !== false);
            setNotifications(data.notificaciones !== false);
          } else {
            setError("No se encontró el perfil profesional.");
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error escuchando configuración:", err);
          setError("Error al cargar la configuración.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [navigate]);

  // =====================================================
  // ACTUALIZAR DISPONIBILIDAD
  // =====================================================
  const handleToggleAvailability = async () => {
    if (!user?.uid || saving) return;

    const newValue = !available;
    setAvailable(newValue);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const specialistRef = doc(db, "specialists", user.uid);
      await updateDoc(specialistRef, { disponible: newValue });
      setMessage(
        newValue
          ? "Tu estado ahora es: Disponible para atender pacientes."
          : "Tu estado ahora es: No disponible temporalmente."
      );
    } catch (err) {
      console.error("Error actualizando disponibilidad:", err);
      setAvailable(!newValue); // rollback
      setError("No se pudo actualizar el estado de disponibilidad.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ACTUALIZAR NOTIFICACIONES
  // =====================================================
  const handleToggleNotifications = async () => {
    if (!user?.uid || saving) return;

    const newValue = !notifications;
    setNotifications(newValue);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const specialistRef = doc(db, "specialists", user.uid);
      await updateDoc(specialistRef, { notificaciones: newValue });
      setMessage(
        newValue
          ? "Notificaciones profesionales activadas."
          : "Notificaciones profesionales pausadas."
      );
    } catch (err) {
      console.error("Error actualizando notificaciones:", err);
      setNotifications(!newValue); // rollback
      setError("No se pudo actualizar la preferencia de notificaciones.");
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
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      setError("No se pudo cerrar la sesión.");
    }
  };

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="settings-loading-state">
          <div className="specialist-spinner"></div>
          <p>Cargando tus preferencias profesionales...</p>
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="specialist-settings-wrapper">
        {/* ===================================================
            HEADER
            =================================================== */}
        <header className="settings-page-header">
          <div>
            <div className="settings-page-badge">
              <span>Ajustes del Sistema</span>
            </div>
            <h1 className="settings-page-title">Configuración Profesional</h1>
            <p className="settings-page-subtitle">
              Administra tu disponibilidad, alertas y preferencias de cuenta en FeelSafe.
            </p>
          </div>
        </header>

        {/* FEEDBACK BANNERS */}
        {message && (
          <div className="settings-alert success">
            <FaCheckCircle /> {message}
          </div>
        )}
        {error && (
          <div className="settings-alert error">
            <FaTimes /> {error}
          </div>
        )}

        {/* ===================================================
            TARJETAS DE CONFIGURACIÓN
            =================================================== */}
        <div className="settings-cards-list">
          {/* Card 1: Disponibilidad */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon green">
                <FaCircle />
              </div>
              <div className="settings-card-title-group">
                <h2>Disponibilidad para Pacientes</h2>
                <p>Define si los usuarios pueden solicitarte chats en tiempo real.</p>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="toggle-info">
                <strong>Estado: {available ? "Disponible" : "No disponible"}</strong>
                <span>
                  {available
                    ? "Los usuarios verán un indicador verde indicando que estás listo para responder."
                    : "Los usuarios verán que estás fuera de horario o atendiendo otras consultas."}
                </span>
              </div>

              <button
                type="button"
                className={`custom-switch ${available ? "on" : "off"}`}
                onClick={handleToggleAvailability}
                disabled={saving}
                aria-label="Cambiar disponibilidad"
              >
                <div className="switch-thumb"></div>
              </button>
            </div>
          </section>

          {/* Card 2: Notificaciones */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon purple">
                <FaBell />
              </div>
              <div className="settings-card-title-group">
                <h2>Alertas y Notificaciones</h2>
                <p>Recibe avisos inmediatos cuando un paciente te envíe un mensaje nuevo.</p>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="toggle-info">
                <strong>Notificaciones en la plataforma</strong>
                <span>
                  {notifications
                    ? "Se te mostrarán distintivos y avisos visuales en tiempo real."
                    : "Alertas silenciadas temporalmente."}
                </span>
              </div>

              <button
                type="button"
                className={`custom-switch ${notifications ? "on" : "off"}`}
                onClick={handleToggleNotifications}
                disabled={saving}
                aria-label="Cambiar notificaciones"
              >
                <div className="switch-thumb"></div>
              </button>
            </div>
          </section>

          {/* Card 3: Datos de Cuenta */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon blue">
                <FaUserShield />
              </div>
              <div className="settings-card-title-group">
                <h2>Información de Seguridad y Acceso</h2>
                <p>Credenciales de tu cuenta profesional verificada.</p>
              </div>
            </div>

            <div className="settings-info-grid">
              <div className="settings-info-row">
                <div className="info-label">
                  <FaEnvelope className="info-icon" />
                  <span>Correo Electrónico:</span>
                </div>
                <strong className="info-value">{user?.email}</strong>
              </div>

              <div className="settings-info-row">
                <div className="info-label">
                  <FaShieldAlt className="info-icon" />
                  <span>Tipo de Cuenta:</span>
                </div>
                <span className="info-badge-verified">Especialista Verificado</span>
              </div>

              <div className="settings-info-row">
                <div className="info-label">
                  <FaCheckCircle className="info-icon" />
                  <span>Estado de la Cuenta:</span>
                </div>
                <strong className="info-value text-green">Activo</strong>
              </div>
            </div>
          </section>

          {/* Card 4: Cerrar Sesión */}
          <section className="settings-card logout-card">
            <div className="settings-card-header">
              <div className="settings-card-icon red">
                <FaSignOutAlt />
              </div>
              <div className="settings-card-title-group">
                <h2>Cerrar Sesión</h2>
                <p>Finaliza tu sesión de trabajo de forma segura en este dispositivo.</p>
              </div>
            </div>

            <div className="logout-action-box">
              <p>
                Al cerrar sesión, tu cuenta permanecerá protegida y podrás volver a ingresar en cualquier momento con tus credenciales.
              </p>
              <button
                type="button"
                className="settings-logout-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Cerrar Sesión de Especialista
              </button>
            </div>
          </section>
        </div>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistSettings;