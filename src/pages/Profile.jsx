import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
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
  FaUserEdit, FaCamera, FaPen, FaPalette, FaGlobe, FaBell, FaLock, 
  FaHeart, FaFileAlt, FaUser, FaInfoCircle, FaSignOutAlt, FaTrash, 
  FaChevronRight, FaImage, FaEye, FaTimes, FaCheck
} from "react-icons/fa";

// =========================================================
// COMPRIMIR IMAGEN A BASE64 (Función de tu amigo)
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
  const { user, updateUserProfile, theme, toggleTheme, language, toggleLanguage } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.es;

  // Referencias para los inputs ocultos de archivos
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Estados
  const [profileImage, setProfileImage] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Sincronizar datos al cargar
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const currentPhoto = user?.photoURL || user?.foto || user?.fotoPerfil || savedImage || "";
    setProfileImage(currentPhoto);
    
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || user?.descripcion || "");
  }, [user]);

  // Función de Firebase de tu amigo: Sincronizar foto
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
      console.error("Error sincronizando foto:", err);
    }
  };

  // Función de Firebase: Procesar archivo de imagen
  const handleProcessFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(language === 'es' ? "Selecciona un archivo de imagen válido." : "Select a valid image file.");
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
      setStatusMessage(language === 'es' ? "Foto actualizada correctamente." : "Photo updated successfully.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error actualizando foto:", err);
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

      await updateUserProfile({ foto: "", fotoPerfil: "", photoURL: "" });

      if (auth.currentUser) {
        try { await updateProfile(auth.currentUser, { photoURL: "" }); } catch {}
      }

      await syncPhotoInConversations("", user?.displayName || user?.nombre);

      setShowPhotoMenu(false);
      setStatusMessage(language === 'es' ? "Foto eliminada." : "Photo deleted.");
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
        try { await updateProfile(auth.currentUser, { displayName: cleanName }); } catch {}
      }

      await syncPhotoInConversations(profileImage || "", cleanName);

      setShowEditProfile(false);
      setStatusMessage(language === 'es' ? "Perfil actualizado correctamente." : "Profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmMsg = language === 'es' ? "¿Estás seguro de que deseas cerrar sesión?" : "Are you sure you want to log out?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      alert(language === 'es' ? "Error al cerrar sesión." : "Error logging out.");
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        {/* INPUTS OCULTOS DE FOTO */}
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleSelectPhoto} />
        <input type="file" accept="image/*" capture="user" ref={cameraInputRef} style={{ display: "none" }} onChange={handleCameraPhoto} />

        {/* MENSAJE DE ÉXITO */}
        {statusMessage && (
          <div className="profile-status" style={{ marginBottom: "15px" }}>
            <FaCheck /> {statusMessage}
          </div>
        )}
        
        {/* Cabecera con portada y avatar flotante (Diseño tuyo) */}
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
                  <div className="avatar-placeholder"><FaUser /></div>
                )}
              </div>
              <div className="camera-btn">
                <FaCamera />
              </div>
            </div>
          </div>

          <div className="profile-header-info">
            <h2>{user?.displayName || user?.nombre || "Usuario"}</h2>
            <span className="user-email">{user?.email}</span>
            <p className="profile-description">
              {user?.description || user?.descripcion || (language === 'es' ? "Añade una descripción sobre ti para personalizar tu perfil." : "Add a bio about yourself to customize your profile.")}
            </p>
          </div>
        </div>

        {/* Estadísticas unificadas */}
        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-value">{user?.streak || 0}</span>
            <span className="stat-label">{language === 'es' ? "Racha" : "Streak"}</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.wellbeing || 72}%</span>
            <span className="stat-label">{language === 'es' ? "Bienestar" : "Wellbeing"}</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.notes?.length || 1}</span>
            <span className="stat-label">{language === 'es' ? "Notas" : "Notes"}</span>
          </div>
        </div>

        {/* Menú: Cuenta */}
        <div className="menu-group">
          <h3 className="menu-title">{language === 'es' ? "Cuenta" : "Account"}</h3>
          <div className="menu-card">
            <button className="menu-item" onClick={() => setShowEditProfile(true)}>
              <div className="menu-item-left">
                <FaUserEdit className="menu-icon text-purple" />
                <span>{language === 'es' ? "Editar perfil y descripción" : "Edit profile and description"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" onClick={() => setShowPhotoMenu(true)}>
              <div className="menu-item-left">
                <FaCamera className="menu-icon text-blue" />
                <span>{language === 'es' ? "Cambio de foto" : "Change photo"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* Menú: Escenarios */}
        <div className="menu-group">
          <h3 className="menu-title">{language === 'es' ? "Escenarios" : "Settings"}</h3>
          <div className="menu-card">
            <button className="menu-item" onClick={toggleTheme} type="button">
              <div className="menu-item-left">
                <FaPalette className="menu-icon text-orange" />
                <span>
                  {language === 'es' ? "Tema: " : "Theme: "}
                  <strong>{theme === "light" ? (language === 'es' ? "Luz ☀️" : "Light ☀️") : (language === 'es' ? "Oscuro 🌙" : "Dark 🌙")}</strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" onClick={toggleLanguage} type="button">
              <div className="menu-item-left">
                <FaGlobe className="menu-icon text-blue" />
                <span>
                  {language === 'es' ? "Idioma: " : "Language: "}
                  <strong>{language === 'es' ? "Español 🇪🇸" : "English 🇺🇸"}</strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* Menú: Aplicación */}
        <div className="menu-group">
          <h3 className="menu-title">{language === 'es' ? "Aplicación" : "Application"}</h3>
          <div className="menu-card">
            <button className="menu-item" type="button">
              <div className="menu-item-left">
                <FaHeart className="menu-icon text-pink" />
                <span>{language === 'es' ? "Cita del día" : "Quote of the day"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item card-danger" type="button" onClick={handleLogout}>
              <div className="menu-item-left">
                <FaSignOutAlt className="menu-icon text-red" />
                <span className="text-red">{language === 'es' ? "Cerrar sesión" : "Log out"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* MODAL EDITAR PERFIL (Amigo) */}
        {showEditProfile && (
          <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Editar Perfil" : "Edit Profile"}</h2>
              <form onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  className="modal-input"
                  placeholder={language === 'es' ? "Tu nombre" : "Your name"}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder={language === 'es' ? "Escribe algo sobre ti..." : "Write something about yourself..."}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="modal-actions">
                  <button type="button" className="modal-cancel-btn" onClick={() => setShowEditProfile(false)}>
                    {language === 'es' ? "Cancelar" : "Cancel"}
                  </button>
                  <button type="submit" className="modal-save-btn" disabled={saving}>
                    {saving ? (language === 'es' ? "Guardando..." : "Saving...") : (language === 'es' ? "Guardar cambios" : "Save changes")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE OPCIONES DE FOTO DE PERFIL (Amigo) */}
        {showPhotoMenu && (
          <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Cambiar foto" : "Change photo"}</h2>
              <div className="modal-options">
                <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={saving}>
                  <FaCamera style={{ marginRight: "8px" }} /> {language === 'es' ? "Tomar foto" : "Take photo"}
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}>
                  <FaImage style={{ marginRight: "8px" }} /> {language === 'es' ? "Elegir de galería" : "Choose from gallery"}
                </button>
                {profileImage && (
                  <>
                    <button type="button" onClick={() => { setShowPhotoMenu(false); setShowImagePreview(true); }}>
                      <FaEye style={{ marginRight: "8px" }} /> {language === 'es' ? "Ver foto" : "View photo"}
                    </button>
                    <button type="button" style={{ color: "#ef4444" }} onClick={handleDeletePhoto} disabled={saving}>
                      <FaTrash style={{ marginRight: "8px" }} /> {language === 'es' ? "Eliminar foto" : "Delete photo"}
                    </button>
                  </>
                )}
              </div>
              <button type="button" className="modal-cancel-btn" onClick={() => setShowPhotoMenu(false)}>
                {language === 'es' ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL VISTA PREVIA DE FOTO (Amigo) */}
        {showImagePreview && (
          <div className="modal-overlay" onClick={() => setShowImagePreview(false)}>
            <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={profileImage} alt="Foto de perfil" />
              <button type="button" className="close-preview-btn" onClick={() => setShowImagePreview(false)}>
                <FaTimes /> {language === 'es' ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Profile;