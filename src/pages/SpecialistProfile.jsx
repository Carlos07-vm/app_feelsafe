import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  FaUserMd,
  FaCamera,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaBriefcase,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaUserCircle,
} from "react-icons/fa";

import { auth, db } from "../services/firebase";
import SpecialistLayout from "../components/SpecialistLayout";
import "../styles/SpecialistProfile.css";

function SpecialistProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    especialidad: "",
    experiencia: "",
    telefono: "",
    ciudad: "",
    descripcion: "",
  });

  // =====================================================
  // 1. CARGAR PERFIL
  // =====================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(firebaseUser);

      try {
        const specialistRef = doc(db, "specialists", firebaseUser.uid);
        const specialistSnap = await getDoc(specialistRef);

        if (!specialistSnap.exists()) {
          setError("No se encontró el registro del especialista.");
          setLoading(false);
          return;
        }

        const data = specialistSnap.data();
        setProfile({ uid: firebaseUser.uid, ...data });
        setForm({
          nombre: data.nombre || firebaseUser.displayName || "",
          especialidad: data.especialidad || "",
          experiencia: data.experiencia ? String(data.experiencia) : "",
          telefono: data.telefono || "",
          ciudad: data.ciudad || "",
          descripcion: data.descripcion || "",
        });
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("Error al cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // COMPRESIÓN DE IMAGEN
  // =====================================================
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxDim = 400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error("Error procesando imagen."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Error leyendo archivo."));
      reader.readAsDataURL(file);
    });
  };

  // =====================================================
  // CAMBIAR FOTO DE PERFIL
  // =====================================================
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setError("");
      setMessage("");

      const base64 = await compressImage(file);

      const specialistRef = doc(db, "specialists", user.uid);
      await updateDoc(specialistRef, { fotoPerfil: base64 });

      setProfile((prev) => ({ ...prev, fotoPerfil: base64 }));
      setMessage("Foto de perfil actualizada correctamente.");
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setError("No se pudo actualizar la foto de perfil.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // GUARDAR DATOS DEL FORMULARIO
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.nombre.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      const specialistRef = doc(db, "specialists", user.uid);
      await updateDoc(specialistRef, {
        nombre: form.nombre.trim(),
        especialidad: form.especialidad.trim(),
        experiencia: Number(form.experiencia) || 0,
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim(),
        descripcion: form.descripcion.trim(),
      });

      setProfile((prev) => ({
        ...prev,
        nombre: form.nombre.trim(),
        especialidad: form.especialidad.trim(),
        experiencia: Number(form.experiencia) || 0,
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim(),
        descripcion: form.descripcion.trim(),
      }));

      setMessage("¡Tu perfil profesional se ha actualizado con éxito!");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setError("No se pudieron guardar los cambios en el perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="profile-loading-state">
          <div className="specialist-spinner"></div>
          <p>Cargando información de tu perfil...</p>
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="specialist-profile-wrapper">
        {/* ===================================================
            HEADER
            =================================================== */}
        <header className="profile-page-header">
          <div>
            <div className="profile-page-badge">
              <span>Identidad Profesional</span>
            </div>
            <h1 className="profile-page-title">Mi Perfil Profesional</h1>
            <p className="profile-page-subtitle">
              Personaliza tu presentación, especialidad y biografía para que los pacientes te conozcan mejor.
            </p>
          </div>
        </header>

        {/* FEEDBACK BANNERS */}
        {message && (
          <div className="profile-alert success">
            <FaCheckCircle /> {message}
          </div>
        )}
        {error && (
          <div className="profile-alert error">
            <FaTimes /> {error}
          </div>
        )}

        {/* ===================================================
            GRID DE PERFIL: TARJETA VISUAL + FORMULARIO
            =================================================== */}
        <div className="profile-layout-grid">
          {/* LADO IZQUIERDO: Tarjeta Resumen y Avatar */}
          <aside className="profile-summary-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                {profile?.fotoPerfil ? (
                  <img
                    src={profile.fotoPerfil}
                    alt={profile.nombre || "Especialista"}
                  />
                ) : (
                  <FaUserCircle className="profile-placeholder-icon" />
                )}
              </div>

              <label
                htmlFor="profile-photo-input"
                className="profile-photo-overlay-btn"
                title="Cambiar foto de perfil"
              >
                <FaCamera />
              </label>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                style={{ display: "none" }}
                disabled={uploadingPhoto}
              />
            </div>

            {uploadingPhoto && (
              <p className="photo-uploading-text">Subiendo foto...</p>
            )}

            <h2 className="summary-name">
              {profile?.nombre || user?.displayName || "Especialista"}
            </h2>
            <span className="summary-badge">
              {profile?.especialidad || "Especialista en Salud Mental"}
            </span>

            <div className="summary-info-list">
              <div className="summary-info-item">
                <FaEnvelope className="summary-info-icon" />
                <span>{user?.email}</span>
              </div>
              {profile?.telefono && (
                <div className="summary-info-item">
                  <FaPhone className="summary-info-icon" />
                  <span>{profile.telefono}</span>
                </div>
              )}
              {profile?.ciudad && (
                <div className="summary-info-item">
                  <FaMapMarkerAlt className="summary-info-icon" />
                  <span>{profile.ciudad}</span>
                </div>
              )}
              {profile?.experiencia > 0 && (
                <div className="summary-info-item">
                  <FaBriefcase className="summary-info-icon" />
                  <span>{profile.experiencia} años de experiencia</span>
                </div>
              )}
            </div>
          </aside>

          {/* LADO DERECHO: Formulario de edición */}
          <main className="profile-form-container">
            <div className="profile-card-header">
              <FaUserMd className="profile-form-icon" />
              <div>
                <h2>Datos Profesionales</h2>
                <p>Edita tu información pública visible para los usuarios.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label>Nombre y Apellidos *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Dra. Sofía Ramírez"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Especialidad / Enfoque *</label>
                  <input
                    type="text"
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    placeholder="Ej. Psicología Clínica, Manejo del Estrés..."
                  />
                </div>

                <div className="profile-field">
                  <label>Años de Experiencia</label>
                  <input
                    type="number"
                    name="experiencia"
                    value={form.experiencia}
                    onChange={handleChange}
                    placeholder="Ej. 5"
                    min={0}
                  />
                </div>

                <div className="profile-field">
                  <label>Teléfono de Contacto</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Ej. +505 8888 8888"
                  />
                </div>

                <div className="profile-field full-width">
                  <label>Ciudad / Ubicación</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ej. Managua, Nicaragua"
                  />
                </div>

                <div className="profile-field full-width">
                  <label>Descripción / Biografía Profesional</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Cuéntale a las personas sobre tu formación, tu enfoque terapéutico y cómo puedes acompañarlas en FeelSafe..."
                  />
                </div>
              </div>

              <div className="profile-form-footer">
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Guardando cambios..." : "Guardar Perfil"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistProfile;