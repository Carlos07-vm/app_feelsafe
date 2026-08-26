import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistRegister.css";

function SpecialistRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    especialidad: "",
    experiencia: "",
    telefono: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ==============================
    // VALIDACIONES
    // ==============================

    if (
      !formData.nombre.trim() ||
      !formData.correo.trim() ||
      !formData.password ||
      !formData.confirmarPassword ||
      !formData.especialidad
    ) {
      setError(
        "Completa todos los campos obligatorios."
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmarPassword
    ) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "1️⃣ Creando especialista en Firebase Authentication..."
      );

      // ==============================
      // CREAR CUENTA AUTH
      // ==============================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.correo.trim(),
          formData.password
        );

      const user = userCredential.user;

      console.log(
        "✅ Usuario creado:",
        user.uid
      );

      // ==============================
      // ACTUALIZAR PERFIL AUTH
      // ==============================

      await updateProfile(user, {
        displayName:
          formData.nombre.trim(),
      });

      console.log(
        "✅ Perfil de Authentication actualizado"
      );

      // ==============================
      // CREAR ESPECIALISTA EN FIRESTORE
      // ==============================

      const specialistRef = doc(
        db,
        "specialists",
        user.uid
      );

      await setDoc(specialistRef, {
        uid: user.uid,

        nombre:
          formData.nombre.trim(),

        correo:
          formData.correo.trim(),

        especialidad:
          formData.especialidad,

        experiencia:
          Number(formData.experiencia) || 0,

        telefono:
          formData.telefono.trim(),

        descripcion:
          formData.descripcion.trim(),

        fotoPerfil: "",

        tipoCuenta:
          "especialista",

        estado:
          "Activo",

        disponible: true,

        correoVerificado:
          false,

        fechaRegistro:
          serverTimestamp(),

        ultimoAcceso:
          serverTimestamp(),
      });

      console.log(
        "✅ Especialista guardado en Firestore"
      );

      // ==============================
      // ÉXITO
      // ==============================

      setSuccess(
        "¡Cuenta profesional creada correctamente!"
      );

      setTimeout(() => {
        navigate(
          "/specialist/dashboard"
        );
      }, 1500);

    } catch (error) {

      console.error(
        "❌ ERROR:",
        error
      );

      console.error(
        "Código:",
        error.code
      );

      console.error(
        "Mensaje:",
        error.message
      );

      // ==============================
      // ERRORES AUTH
      // ==============================

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "Este correo ya está registrado. Utiliza otro correo o inicia sesión."
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setError(
          "El correo electrónico no es válido."
        );

      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        setError(
          "La contraseña es demasiado débil."
        );

      // ==============================
      // ERROR FIRESTORE
      // ==============================

      } else if (
        error.code ===
        "permission-denied"
      ) {
        setError(
          "Firebase Authentication creó la cuenta, pero Firestore no permitió guardar el especialista. Revisa las reglas de Firestore."
        );

      } else {

        setError(
          "No se pudo completar el registro. Revisa la consola."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="specialist-register">

      {/* ==============================
          PANEL IZQUIERDO
      ============================== */}

      <div className="specialist-register-left">

        <div className="specialist-brand">

          <div className="brand-icon">
            ♡
          </div>

          <div>
            <h2>FeelSafe</h2>
            <span>
              Especialistas
            </span>
          </div>

        </div>

        <div className="register-hero">

          <span className="hero-badge">
            ✦ Profesionales de la salud mental
          </span>

          <h1>
            Ayuda a las personas a
            <span>
              sentirse mejor.
            </span>
          </h1>

          <p>
            Únete a FeelSafe y brinda
            acompañamiento profesional
            a personas que necesitan
            orientación y apoyo.
          </p>

          <div className="hero-features">

            <div>
              <strong>✓</strong>
              <span>
                Comunicación segura
              </span>
            </div>

            <div>
              <strong>✓</strong>
              <span>
                Chat en tiempo real
              </span>
            </div>

            <div>
              <strong>✓</strong>
              <span>
                Gestión de conversaciones
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ==============================
          FORMULARIO
      ============================== */}

      <div className="specialist-register-right">

        <div className="register-card">

          <div className="register-title">

            <span>
              CUENTA PROFESIONAL
            </span>

            <h1>
              Crear cuenta de especialista
            </h1>

            <p>
              Completa tus datos profesionales
              para comenzar.
            </p>

          </div>

          {/* MENSAJE ERROR */}

          {error && (
            <div className="register-message error">
              {error}
            </div>
          )}

          {/* MENSAJE ÉXITO */}

          {success && (
            <div className="register-message success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* NOMBRE */}

            <div className="form-group">

              <label>
                Nombre completo *
              </label>

              <input
                type="text"
                name="nombre"
                placeholder="Ej. María López"
                value={formData.nombre}
                onChange={handleChange}
              />

            </div>

            {/* CORREO */}

            <div className="form-group">

              <label>
                Correo electrónico *
              </label>

              <input
                type="email"
                name="correo"
                placeholder="especialista@email.com"
                value={formData.correo}
                onChange={handleChange}
              />

            </div>

            {/* CONTRASEÑAS */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Contraseña *
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Confirmar contraseña *
                </label>

                <input
                  type="password"
                  name="confirmarPassword"
                  placeholder="Repite la contraseña"
                  value={
                    formData.confirmarPassword
                  }
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* ESPECIALIDAD + EXPERIENCIA */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Especialidad *
                </label>

                <select
                  name="especialidad"
                  value={
                    formData.especialidad
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Selecciona una especialidad
                  </option>

                  <option value="Psicología">
                    Psicología
                  </option>

                  <option value="Psicología clínica">
                    Psicología clínica
                  </option>

                  <option value="Psiquiatría">
                    Psiquiatría
                  </option>

                  <option value="Orientación psicológica">
                    Orientación psicológica
                  </option>

                  <option value="Terapia familiar">
                    Terapia familiar
                  </option>

                  <option value="Otra">
                    Otra
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Años de experiencia
                </label>

                <input
                  type="number"
                  name="experiencia"
                  min="0"
                  placeholder="Ej. 5"
                  value={
                    formData.experiencia
                  }
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* TELÉFONO */}

            <div className="form-group">

              <label>
                Teléfono
              </label>

              <input
                type="tel"
                name="telefono"
                placeholder="Ej. 8888-8888"
                value={
                  formData.telefono
                }
                onChange={handleChange}
              />

            </div>

            {/* DESCRIPCIÓN */}

            <div className="form-group">

              <label>
                Descripción profesional
              </label>

              <textarea
                name="descripcion"
                rows="4"
                placeholder="Cuéntanos sobre tu experiencia profesional..."
                value={
                  formData.descripcion
                }
                onChange={handleChange}
              />

            </div>

            {/* BOTÓN */}

            <button
              type="submit"
              className="specialist-register-button"
              disabled={loading}
            >

              {loading
                ? "Creando cuenta..."
                : "Crear cuenta profesional"}

            </button>

          </form>

          <div className="register-footer">

            <span>
              ¿Ya tienes una cuenta?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >
              Iniciar sesión
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SpecialistRegister;