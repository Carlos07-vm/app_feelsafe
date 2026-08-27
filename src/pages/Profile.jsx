import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { 
  FaUser, FaCamera, FaPen, FaPalette, FaGlobe, FaBell, FaLock, 
  FaHeart, FaFileAlt, FaInfoCircle, FaSignOutAlt, FaTrash, FaChevronRight,
  FaImage, FaEye, FaTimes, FaCheck
} from "react-icons/fa";

// =========================================================
// 1. DICCIONARIO DE TRADUCCIONES
// =========================================================
const translations = {
  es: {
    account: "Cuenta",
    editProfile: "Editar perfil",
    changePhoto: "Cambiar foto",
    updateDesc: "Actualizar descripción",
    settings: "Configuración",
    theme: "Tema",
    themeLight: "Claro ☀️",
    themeDark: "Oscuro 🌙",
    language: "Idioma",
    langEs: "Español 🇪🇸",
    langEn: "Inglés 🇺🇸",
    notifications: "Notificaciones",
    privacy: "Privacidad",
    application: "Aplicación",
    quote: "Frase del día",
    privacyPolicy: "Política de privacidad",
    about: "Acerca de FeelSafe",
    logout: "Cerrar sesión",
    deleteAccount: "Eliminar cuenta",
    streak: "Racha",
    wellbeing: "Bienestar",
    notes: "Notas",
    noDesc: "Añade una descripción sobre ti para personalizar tu perfil.",
    photoUpdated: "Foto de perfil actualizada correctamente.",
    profileUpdated: "Perfil actualizado correctamente.",
  },
  en: {
    account: "Account",
    editProfile: "Edit Profile",
    changePhoto: "Change Photo",
    updateDesc: "Update Description",
    settings: "Settings",
    theme: "Theme",
    themeLight: "Light ☀️",
    themeDark: "Dark 🌙",
    language: "Language",
    langEs: "Spanish 🇪🇸",
    langEn: "English 🇺🇸",
    notifications: "Notifications",
    privacy: "Privacy",
    application: "Application",
    quote: "Quote of the Day",
    privacyPolicy: "Privacy Policy",
    about: "About FeelSafe",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    streak: "Streak",
    wellbeing: "Wellbeing",
    notes: "Notes",
    noDesc: "Add a description about yourself to customize your profile.",
    photoUpdated: "Profile picture updated successfully.",
    profileUpdated: "Profile updated successfully.",
  }
};

// =========================================================
// COMPRIMIR IMAGEN A BASE64
// =========================================================
const compressImage = (file, maxWidth = 400, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", quality);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
};

function Profile() {
  const { 
    user, updateUserProfile, theme, toggleTheme, language, toggleLanguage 
  } = useApp();
  
  const navigate = useNavigate();
  const t = translations[language] || translations.es;

  const [profileImage, setProfileImage] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const currentPhoto = user?.photoURL || user?.foto || user?.fotoPerfil || savedImage || "";
    setProfileImage(currentPhoto);
    
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || user?.descripcion || "");
  }, [user]);

  // Sincronizar foto en todas las conversaciones con especialistas
  const syncPhotoInConversations = async (photoBase64, name) => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "conversaciones_especialistas"),
        where("usuarioId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map((docSnap) => {
        return updateDoc(doc(db, "conversaciones_especialistas", docSnap.id), {
          usuarioFoto: photoBase64,
          ...(name ? { usuarioNombre: name } : {}),
        });
      });
      await Promise.all(updates);
    } catch (err) {
      console.error("Error sincronizando foto en conversaciones:", err);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cerrar sesión?")) return;
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  const handleProcessFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    try {
      setSaving(true);
      const base64 = await compressImage(file, 400, 0.75);
      setProfileImage(base64);
      localStorage.setItem("profileImage", base64);

      await updateUserProfile({
        foto: base64,
        fotoPerfil: base64,
        photoURL: base64,
      });

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: base64 });
        } catch {}
      }

      await syncPhotoInConversations(base64, user?.displayName || user?.nombre);

      setShowPhotoMenu(false);
      setStatusMessage(t.photoUpdated);
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error actualizando foto:", err);
      alert("No se pudo procesar la imagen.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPhoto = async (e) => {
    const file = e.target.files?.[0];
    await handleProcessFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraPhoto = async (e) => {
    const file = e.target.files?.[0];
    await handleProcessFile(file);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleDeletePhoto = async () => {
    try {
      setSaving(true);
      setProfileImage("");
      localStorage.removeItem("profileImage");

      await updateUserProfile({
        foto: "",
        fotoPerfil: "",
        photoURL: "",
      });

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: "" });
        } catch {}
      }

      await syncPhotoInConversations("", user?.displayName || user?.nombre);

      setShowPhotoMenu(false);
      setStatusMessage("Foto de perfil eliminada.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error eliminando foto:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setSaving(true);
      const cleanName = editName.trim();
      const cleanDesc = editDescription.trim();

      await updateUserProfile({
        displayName: cleanName,
        nombre: cleanName,
        description: cleanDesc,
        descripcion: cleanDesc,
      });

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: cleanName });
        } catch {}
      }

      await syncPhotoInConversations(profileImage || "", cleanName);

      setShowEditProfile(false);
      setStatusMessage(t.profileUpdated);
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        {/* INPUTS OCULTOS DE FOTO */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleSelectPhoto}
        />
        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={cameraInputRef}
          style={{ display: "none" }}
          onChange={handleCameraPhoto}
        />

        {/* MENSAJE DE ÉXITO */}
        {statusMessage && (
          <div className="profile-status-banner">
            <FaCheck /> {statusMessage}
          </div>
        )}
        
        {/* =================================================
            CABECERA DEL PERFIL
        ================================================= */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={() => setShowPhotoMenu(true)}>
              <div className="avatar-img-container">
                {profileImage ? (
                  <img src={profileImage} alt="Perfil" />
                ) : user?.photoURL || user?.foto ? (
                  <img src={user.photoURL || user.foto} alt="Perfil" />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <button
                className="camera-btn"
                type="button"
                aria-label="Cambiar foto de perfil"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoMenu(true);
                }}
              >
                <FaCamera />
              </button>
            </div>
          </div>

          <div className="profile-header-info">
            <h2>{user?.displayName || user?.nombre || "Usuario"}</h2>
            <span className="user-email">{user?.email || ""}</span>
            <p className="profile-description">
              {user?.description || user?.descripcion || t.noDesc}
            </p>
          </div>
        </div>

        {/* =================================================
            ESTADÍSTICAS
        ================================================= */}
        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-value">{user?.streak ?? 0}</span>
            <span className="stat-label">🔥 {t.streak}</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.wellbeing ?? 72}%</span>
            <span className="stat-label">💚 {t.wellbeing}</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.notes?.length || 0}</span>
            <span className="stat-label">📝 {t.notes}</span>
          </div>
        </div>

        {/* =================================================
            MENÚS CON DICCIONARIO
        ================================================= */}
        <div className="menu-group">
          <h3 className="menu-title">{t.account}</h3>
          <div className="menu-card">
            <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
              <div className="menu-item-left"><FaUser className="menu-icon text-purple" /> <span>{t.editProfile}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => setShowPhotoMenu(true)}>
              <div className="menu-item-left"><FaCamera className="menu-icon text-blue" /> <span>{t.changePhoto}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
              <div className="menu-item-left"><FaPen className="menu-icon text-green" /> <span>{t.updateDesc}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        <div className="menu-group">
          <h3 className="menu-title">{t.settings}</h3>
          <div className="menu-card">
            <button className="menu-item" type="button" onClick={toggleTheme}>
              <div className="menu-item-left"><FaPalette className="menu-icon text-orange" /> <span>{t.theme}: {theme === 'light' ? t.themeLight : t.themeDark}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={toggleLanguage}>
              <div className="menu-item-left"><FaGlobe className="menu-icon text-blue" /> <span>{t.language}: {language === 'es' ? t.langEs : t.langEn}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button">
              <div className="menu-item-left"><FaBell className="menu-icon text-yellow" /> <span>{t.notifications}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button">
              <div className="menu-item-left"><FaLock className="menu-icon text-gray" /> <span>{t.privacy}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        <div className="menu-group">
          <h3 className="menu-title">{t.application}</h3>
          <div className="menu-card">
            <button className="menu-item" type="button">
              <div className="menu-item-left"><FaHeart className="menu-icon text-pink" /> <span>{t.quote}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button">
              <div className="menu-item-left"><FaFileAlt className="menu-icon text-gray" /> <span>{t.privacyPolicy}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button">
              <div className="menu-item-left"><FaInfoCircle className="menu-icon text-blue" /> <span>{t.about}</span></div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        <div className="menu-group">
          <div className="menu-card card-danger">
            <button className="menu-item text-red" type="button" onClick={handleLogout}>
              <div className="menu-item-left"><FaSignOutAlt className="menu-icon" /> <span>{t.logout}</span></div>
            </button>
            <button className="menu-item text-red" type="button">
              <div className="menu-item-left"><FaTrash className="menu-icon" /> <span>{t.deleteAccount}</span></div>
            </button>
          </div>
        </div>

        {/* =================================================
            MODAL DE OPCIONES DE FOTO DE PERFIL
        ================================================= */}
        {showPhotoMenu && (
          <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t.changePhoto}</h2>
              <div className="modal-options">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={saving}
                >
                  <FaCamera style={{ marginRight: "8px" }} /> Tomar foto con la cámara
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <FaImage style={{ marginRight: "8px" }} /> Elegir de la galería
                </button>
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoMenu(false);
                      setShowImagePreview(true);
                    }}
                  >
                    <FaEye style={{ marginRight: "8px" }} /> Ver foto actual
                  </button>
                )}
                {profileImage && (
                  <button
                    type="button"
                    style={{ color: "#ef4444" }}
                    onClick={handleDeletePhoto}
                    disabled={saving}
                  >
                    <FaTrash style={{ marginRight: "8px" }} /> Eliminar foto
                  </button>
                )}
              </div>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowPhotoMenu(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            MODAL EDITAR PERFIL
        ================================================= */}
        {showEditProfile && (
          <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t.editProfile}</h2>
              <form onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Tu nombre completo"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder="Escribe una breve descripción sobre ti..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowEditProfile(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
            MODAL VISTA PREVIA DE FOTO
        ================================================= */}
        {showImagePreview && (
          <div className="modal-overlay" onClick={() => setShowImagePreview(false)}>
            <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={profileImage} alt="Foto de perfil grande" />
              <button
                type="button"
                className="close-preview-btn"
                onClick={() => setShowImagePreview(false)}
              >
                <FaTimes /> Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Profile;