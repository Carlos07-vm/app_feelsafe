import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaUserMd,
  FaCheckCircle,
  FaArrowRight,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaBriefcase,
  FaAward,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import logo from "../assets/logo.jpeg";
import "../styles/SpecialistRegister.css";

function SpecialistRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    especialidad: "Psicología Clínica",
    experiencia: "",
    telefono: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.nombre.trim() ||
      !formData.correo.trim() ||
      !formData.password ||
      !formData.confirmarPassword ||
      !formData.especialidad
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.correo.trim(),
        formData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.nombre.trim(),
      });

      const specialistRef = doc(db, "specialists", user.uid);
      await setDoc(specialistRef, {
        uid: user.uid,
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        especialidad: formData.especialidad,
        experiencia: Number(formData.experiencia) || 0,
        telefono: formData.telefono.trim(),
        descripcion: formData.descripcion.trim(),
        fotoPerfil: "",
        tipoCuenta: "especialista",
        estado: "Pendiente", // Requiere aprobación antes de operar
        disponible: false,
        correoVerificado: false,
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
      });

      setSuccess("¡Cuenta profesional creada exitosamente! Redirigiendo...");
      setTimeout(() => {
        navigate("/specialist/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error en registro:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado. Por favor inicia sesión.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico ingresado no es válido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es muy débil. Usa al menos 8 caracteres.");
      } else {
        setError("Ocurrió un error al registrar tu cuenta. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="specialist-register-container">
      {/* LADO IZQUIERDO: Hero Institucional FeelSafe */}
      <div className="register-hero-side">
        <div className="register-hero-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="FeelSafe Logo" />
          <div>
            <h2>FeelSafe</h2>
            <span>Red de Especialistas</span>
          </div>
        </div>

        <div className="register-hero-center">
          <div className="hero-pill-badge">
            <FaAward /> Únete como Profesional
          </div>
          <h1>
            Acompaña y transforma vidas en <span>FeelSafe</span>
          </h1>
          <p>
            Sé parte de nuestra comunidad de profesionales de la salud mental. Conecta con personas que buscan orientación, gestiona tus consultas y brinda apoyo seguro.
          </p>

          <div className="hero-perks-list">
            <div className="perk-item">
              <FaCheckCircle className="perk-icon" />
              <span>Gestión integral de citas y agenda personalizada</span>
            </div>
            <div className="perk-item">
              <FaCheckCircle className="perk-icon" />
              <span>Chat seguro y directo en tiempo real con pacientes</span>
            </div>
            <div className="perk-item">
              <FaCheckCircle className="perk-icon" />
              <span>Perfil profesional verificado y visibilidad en FeelSafe</span>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Formulario de Registro */}
      <div className="register-form-side">
        <div className="register-card-box">
          <div className="form-header-group">
            <span className="form-subtitle">REGISTRO DE PROFESIONAL</span>
            <h1>Crear Cuenta de Especialista</h1>
            <p>Completa tus datos profesionales para unirte a FeelSafe.</p>
          </div>

          {error && <div className="auth-alert error">⚠️ {error}</div>}
          {success && <div className="auth-alert success">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="auth-register-form">
            <div className="auth-fields-grid">
              <div className="auth-field full">
                <label>Nombre y Apellidos *</label>
                <div className="auth-input-wrap">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Dra. Carmen Morales"
                    required
                  />
                </div>
              </div>

              <div className="auth-field full">
                <label>Correo Electrónico *</label>
                <div className="auth-input-wrap">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Contraseña *</label>
                <div className="auth-input-wrap">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Confirmar Contraseña *</label>
                <div className="auth-input-wrap">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Especialidad Principal *</label>
                <div className="auth-input-wrap">
                  <FaUserMd className="input-icon" />
                  <select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                  >
                    <option value="Psicología Clínica">Psicología Clínica</option>
                    <option value="Terapia Cognitivo-Conductual">Terapia Cognitivo-Conductual</option>
                    <option value="Psicoterapia y Manejo de Ansiedad">Psicoterapia y Manejo de Ansiedad</option>
                    <option value="Terapia Familiar y de Pareja">Terapia Familiar y de Pareja</option>
                    <option value="Mindfulness y Bienestar Emocional">Mindfulness y Bienestar Emocional</option>
                    <option value="Psicología Educativa">Psicología Educativa</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label>Años de Experiencia</label>
                <div className="auth-input-wrap">
                  <FaBriefcase className="input-icon" />
                  <input
                    type="number"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    placeholder="Ej. 4"
                    min={0}
                  />
                </div>
              </div>

              <div className="auth-field full">
                <label>Teléfono de Contacto</label>
                <div className="auth-input-wrap">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. +505 8888 8888"
                  />
                </div>
              </div>

              <div className="auth-field full">
                <label>Biografía / Presentación Profesional</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe brevemente tu enfoque, trayectoria o mensaje para tus pacientes..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? "Creando cuenta profesional..." : "Registrarme como Especialista"}
            </button>
          </form>

          <div className="register-footer-links">
            <p>
              ¿Ya tienes cuenta profesional?{" "}
              <Link to="/login" className="login-link">
                Inicia sesión aquí <FaArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialistRegister;
