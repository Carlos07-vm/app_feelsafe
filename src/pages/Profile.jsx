import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

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

  const getMoodColor = (mood) => {
    switch (mood?.toLowerCase()) {
      case "feliz":
        return "#4CAF50";
      case "triste":
        return "#2196F3";
      case "estresado":
        return "#FF9800";
      case "ansioso":
        return "#E91E63";
      case "enojado":
        return "#F44336";
      default:
        return "#6C63FF";
    }
  };

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
        <div className="profile-header">
          <div className="profile-avatar" onClick={() => setShowPhotoMenu(true)}>
            <div className="avatar">
              {profileImage ? (
                <img src={profileImage} alt="Perfil" />
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt="Perfil" />
              ) : (
                "👤"
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
              📷
            </button>
          </div>

          <div className="profile-header-info">
            <h2>{user?.displayName || user?.nombre || "Usuario"}</h2>
            <p className="profile-description">
              {user?.description || "Añade una descripción sobre ti para personalizar tu perfil."}
            </p>
            <div className="profile-contact">
              <span>{user?.email || "Correo no registrado"}</span>
              <span>{user?.provider ? `Proveedor: ${user.provider}` : "Proveedor: email"}</span>
            </div>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="info-item">
            <span>😊 Estado</span>
            <div className="mood-badge" style={{ backgroundColor: getMoodColor(user?.currentMood) }}>
              {user?.currentMood || "Neutral"}
            </div>
          </div>
          <div className="info-item">
            <span>🎂 Edad</span>
            <strong>{user?.profile?.age ? `${user.profile.age} años` : "No especificado"}</strong>
          </div>
          <div className="info-item">
            <span>💚 Bienestar</span>
            <strong>{user?.wellbeing ?? 72}%</strong>
          </div>
          <div className="info-item">
            <span>📌 Racha</span>
            <strong>{user?.streak ?? 0} días</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${user?.wellbeing ?? 72}%` }} />
          </div>
        </div>

        {statusMessage && <div className="profile-status">{statusMessage}</div>}

        <div className="stats">
          <div className="stat-card">
            <h3>{user?.streak ?? 0}</h3>
            <p>🔥 Racha</p>
          </div>
          <div className="stat-card">
            <h3>{user?.notes?.length || 0}</h3>
            <p>📝 Notas</p>
          </div>
          <div className="stat-card">
            <h3>{user?.wellbeing ?? 72}%</h3>
            <p>💚 Salud</p>
          </div>
        </div>

        <div className="profile-menu">
          <div className="menu-title">Cuenta</div>
          <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
            <span>👤 Editar perfil</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => setShowPhotoMenu(true)}>
            <span>📷 Cambiar foto</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => setShowEditProfile(true)}>
            <span>✍️ Actualizar descripción</span>
            <span>›</span>
          </button>
        </div>

        <div className="profile-menu">
          <div className="menu-title">Configuración</div>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Tema oscuro disponible pronto.")}>
            <span>🎨 Tema</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Próximo soporte para idiomas.")}>
            <span>🌎 Idioma</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Notificaciones activadas próximamente.")}>
            <span>🔔 Notificaciones</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Privacidad mejorada en la próxima versión.")}>
            <span>🔒 Privacidad</span>
            <span>›</span>
          </button>
        </div>

        <div className="profile-menu">
          <div className="menu-title">Aplicación</div>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Frase del día visible en el dashboard.")}>
            <span>💙 Frase del día</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Política de privacidad disponible pronto.")}>
            <span>📄 Política de privacidad</span>
            <span>›</span>
          </button>
          <button className="menu-item" type="button" onClick={() => handleModalAction("Más información sobre FeelSafe próximamente.")}>
            <span>ℹ️ Acerca de FeelSafe</span>
            <span>›</span>
          </button>
        </div>

        {latestNote && (
          <div className="last-note">
            <h3>📝 Última nota</h3>
            <p>{latestNote.text}</p>
          </div>
        )}

        <div className="danger-zone">
          <button className="logout-btn" type="button" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
          <button className="delete-btn" type="button" onClick={() => alert("La eliminación de cuenta está disponible en la próxima versión.")}>
            🗑 Eliminar cuenta
          </button>
        </div>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSelectPhoto} hidden />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleSelectPhoto} hidden />

      {showPhotoMenu && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cambiar foto de perfil</h2>
            <button className="menu-item" type="button" onClick={openGallery}>
              <span>🖼 Elegir de la galería</span>
              <span>›</span>
            </button>
            <button className="menu-item" type="button" onClick={openCamera}>
              <span>📷 Tomar foto</span>
              <span>›</span>
            </button>
            <button className="menu-item" type="button" onClick={viewPhoto}>
              <span>👁 Ver foto</span>
              <span>›</span>
            </button>
            <button className="menu-item" type="button" onClick={handleDeletePhoto}>
              <span>🗑 Eliminar foto</span>
              <span>›</span>
            </button>
            <button className="menu-item" type="button" onClick={() => setShowPhotoMenu(false)}>
              <span>❌ Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar perfil</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nombre"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descripción breve"
              rows={4}
            />
            <div className="modal-buttons">
              <button className="cancel-btn" type="button" onClick={() => setShowEditProfile(false)}>
                Cancelar
              </button>
              <button className="save-btn" type="button" onClick={handleSaveProfile}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePreview && (
        <div className="modal-overlay">
          <div className="image-preview">
            <img src={profileImage || user?.photoURL} alt="Foto de perfil" />
            <button className="close-preview" type="button" onClick={() => setShowImagePreview(false)}>
              ❌ Cerrar
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Profile;
