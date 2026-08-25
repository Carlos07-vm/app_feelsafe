import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { 
  FaUser, 
  FaCamera, 
  FaPen, 
  FaPalette, 
  FaGlobe, 
  FaBell, 
  FaLock, 
  FaHeart, 
  FaFileAlt, 
  FaInfoCircle, 
  FaSignOutAlt, 
  FaTrash,
  FaChevronRight
} from "react-icons/fa";

function Profile() {
  const { user, updateUserProfile } = useApp();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    } else {
      setProfileImage(user?.photoURL || user?.foto || "");
    }
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || "");
  }, [user]);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  const handleLogout = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cerrar sesión?")) return;
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  const handleSelectPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async () => {
      const image = reader.result;
      setProfileImage(image);
      await updateUserProfile({ foto: image, photoURL: image });
      setStatusMessage("Foto de perfil actualizada.");
      setShowPhotoMenu(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("¿Eliminar la foto de perfil?")) return;
    setProfileImage("");
    await updateUserProfile({ foto: "", photoURL: "" });
    localStorage.removeItem("profileImage");
    setShowPhotoMenu(false);
    setStatusMessage("Foto eliminada correctamente.");
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setStatusMessage("El nombre no puede estar vacío.");
      return;
    }
    await updateUserProfile({
      displayName: editName.trim(),
      nombre: editName.trim(),
      description: editDescription.trim(),
    });
    setShowEditProfile(false);
    setStatusMessage("Perfil actualizado con éxito.");
  };

  const handleModalAction = (message) => {
    setStatusMessage(message);
    setShowPhotoMenu(false);
  };

  const openGallery = () => {
    fileInputRef.current?.click();
    setShowPhotoMenu(false);
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
    setShowPhotoMenu(false);
  };

  const viewPhoto = () => {
    if (profileImage || user?.photoURL) {
      setShowImagePreview(true);
      setShowPhotoMenu(false);
    } else {
      setStatusMessage("No tienes una foto de perfil.");
    }
  };

  const latestNote = user?.notes?.[user.notes.length - 1];

  return (
    <MainLayout>
      <div className="profile-page">
        
        {/* =================================================
            CABECERA DEL PERFIL (Portada y Avatar)
        ================================================= */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={() => setShowPhotoMenu(true)}>
              <div className="avatar-img-container">
                {profileImage ? (
                  <img src={profileImage} alt="Perfil" />
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <button
                className="camera-btn"
                type="button"
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
            <span className="user-email">{user?.email || "Correo no registrado"}</span>
            <p className="profile-description">
              {user?.description || "Añade una descripción sobre ti para personalizar tu perfil."}
            </p>
          </div>
        </div>

        {/* =================================================
            ESTADÍSTICAS UNIFICADAS
        ================================================= */}
        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-value">{user?.streak ?? 0}</span>
            <span className="stat-label">🔥 Racha</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.wellbeing ?? 72}%</span>
            <span className="stat-label">💚 Bienestar</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user?.notes?.length || 0}</span>
            <span className="stat-label">📝 Notas</span>
          </div>
        </div>

        {statusMessage && <div className="profile-status">{statusMessage}</div>}

        {/* =================================================
            MENÚS DE CONFIGURACIÓN
        ================================================= */}
        
        {/* SECCIÓN: CUENTA */}
        <div className="menu-group">
          <h3 className="menu-title">Cuenta</h3>
          <div className="menu-card">
            <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
              <div className="menu-item-left">
                <FaUser className="menu-icon text-purple" />
                <span>Editar perfil</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => setShowPhotoMenu(true)}>
              <div className="menu-item-left">
                <FaCamera className="menu-icon text-blue" />
                <span>Cambiar foto</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
              <div className="menu-item-left">
                <FaPen className="menu-icon text-green" />
                <span>Actualizar descripción</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN: CONFIGURACIÓN */}
        <div className="menu-group">
          <h3 className="menu-title">Configuración</h3>
          <div className="menu-card">
            <button className="menu-item" type="button" onClick={() => handleModalAction("Tema oscuro disponible pronto.")}>
              <div className="menu-item-left">
                <FaPalette className="menu-icon text-orange" />
                <span>Tema</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => handleModalAction("Próximo soporte para idiomas.")}>
              <div className="menu-item-left">
                <FaGlobe className="menu-icon text-blue" />
                <span>Idioma</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => handleModalAction("Notificaciones activadas próximamente.")}>
              <div className="menu-item-left">
                <FaBell className="menu-icon text-yellow" />
                <span>Notificaciones</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => handleModalAction("Privacidad mejorada en la próxima versión.")}>
              <div className="menu-item-left">
                <FaLock className="menu-icon text-gray" />
                <span>Privacidad</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN: APLICACIÓN */}
        <div className="menu-group">
          <h3 className="menu-title">Aplicación</h3>
          <div className="menu-card">
            <button className="menu-item" type="button" onClick={() => handleModalAction("Frase del día visible en el dashboard.")}>
              <div className="menu-item-left">
                <FaHeart className="menu-icon text-pink" />
                <span>Frase del día</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => handleModalAction("Política de privacidad disponible pronto.")}>
              <div className="menu-item-left">
                <FaFileAlt className="menu-icon text-gray" />
                <span>Política de privacidad</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
            <button className="menu-item" type="button" onClick={() => handleModalAction("Más información sobre FeelSafe próximamente.")}>
              <div className="menu-item-left">
                <FaInfoCircle className="menu-icon text-blue" />
                <span>Acerca de FeelSafe</span>
              </div>
              <FaChevronRight className="menu-arrow" />
            </button>
          </div>
        </div>

        {/* SECCIÓN: ZONA DE PELIGRO */}
        <div className="menu-group">
          <div className="menu-card card-danger">
            <button className="menu-item text-red" type="button" onClick={handleLogout}>
              <div className="menu-item-left">
                <FaSignOutAlt className="menu-icon" />
                <span>Cerrar sesión</span>
              </div>
            </button>
            <button className="menu-item text-red" type="button" onClick={() => alert("La eliminación de cuenta está disponible en la próxima versión.")}>
              <div className="menu-item-left">
                <FaTrash className="menu-icon" />
                <span>Eliminar cuenta</span>
              </div>
            </button>
          </div>
        </div>

        {/* =================================================
            MODALES (Archivos ocultos e interfaces emergentes)
        ================================================= */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSelectPhoto} hidden />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleSelectPhoto} hidden />

        {showPhotoMenu && (
          <div className="modal-overlay" onClick={() => setShowPhotoMenu(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cambiar foto</h2>
              <div className="modal-options">
                <button type="button" onClick={openGallery}>🖼 Elegir de la galería</button>
                <button type="button" onClick={openCamera}>📷 Tomar foto</button>
                <button type="button" onClick={viewPhoto}>👁 Ver foto actual</button>
                <button type="button" className="text-red" onClick={handleDeletePhoto}>🗑 Eliminar foto</button>
              </div>
              <button className="modal-cancel-btn" type="button" onClick={() => setShowPhotoMenu(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {showEditProfile && (
          <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Editar perfil</h2>
              <input
                className="modal-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre"
              />
              <textarea
                className="modal-textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Escribe una breve descripción sobre ti..."
                rows={4}
              />
              <div className="modal-actions">
                <button className="modal-cancel-btn" type="button" onClick={() => setShowEditProfile(false)}>
                  Cancelar
                </button>
                <button className="modal-save-btn" type="button" onClick={handleSaveProfile}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {showImagePreview && (
          <div className="modal-overlay" onClick={() => setShowImagePreview(false)}>
            <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={profileImage || user?.photoURL} alt="Foto de perfil" />
              <button className="close-preview-btn" type="button" onClick={() => setShowImagePreview(false)}>
                Cerrar vista
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Profile;