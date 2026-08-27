import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
import { useState } from "react";
import { 
  FaUserEdit, 
  FaCamera, 
  FaPen, 
  FaPalette, 
  FaGlobe, 
  FaBell, 
  FaLock, 
  FaHeart, 
  FaFileAlt,
  FaUser
} from "react-icons/fa";

function Profile() {
  // AQUÍ ESTÁ LA MAGIA: Importamos toggleTheme y toggleLanguage directamente del contexto
  const { user, setUser, theme, toggleTheme, language, toggleLanguage } = useApp();
  const t = translations[language] || translations.es;

  // Estados para modales y edición
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const [name, setName] = useState(user?.name || "Merlo");
  const [description, setDescription] = useState(user?.description || "");
  const [photo, setPhoto] = useState(user?.photo || null);

  const handleSaveName = (e) => {
    e.preventDefault();
    setUser({ ...user, name });
    setIsEditingName(false);
  };

  const handleSaveDesc = (e) => {
    e.preventDefault();
    setUser({ ...user, description });
    setIsEditingDesc(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setUser({ ...user, photo: reader.result });
        setIsPhotoModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        
        {/* Cabecera con portada y avatar flotante */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={() => setIsPhotoModalOpen(true)}>
              <div className="avatar-img-container">
                {photo || user?.photo ? (
                  <img src={photo || user.photo} alt="Avatar" />
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
            <h2>{user?.name || name}</h2>
            <span className="user-email">{user?.email || "exequielmerlo2@gmail.com"}</span>
            <p className="profile-description">
              {user?.description || description || (language === 'es' ? "Añade una descripción sobre ti para personalizar tu perfil." : "Add a bio about yourself to customize your profile.")}
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
            <button className="menu-item" onClick={() => setIsEditingName(true)}>
              <div className="menu-item-left">
                <FaUserEdit className="menu-icon text-purple" />
                <span>{language === 'es' ? "Editar perfil" : "Edit profile"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" onClick={() => setIsPhotoModalOpen(true)}>
              <div className="menu-item-left">
                <FaCamera className="menu-icon text-blue" />
                <span>{language === 'es' ? "Cambio de foto" : "Change photo"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" onClick={() => setIsEditingDesc(true)}>
              <div className="menu-item-left">
                <FaPen className="menu-icon text-green" />
                <span>{language === 'es' ? "Actualización de la descripción" : "Update description"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* Menú: Escenarios */}
        <div className="menu-group">
          <h3 className="menu-title">{language === 'es' ? "Escenarios" : "Settings"}</h3>
          <div className="menu-card">
            
            {/* Los botones usan toggleTheme y toggleLanguage directamente */}
            <button className="menu-item" onClick={toggleTheme} type="button">
              <div className="menu-item-left">
                <FaPalette className="menu-icon text-orange" />
                <span>
                  {language === 'es' ? "Tema" : "Theme"}:{" "}
                  <strong>
                    {theme === "light" 
                      ? (language === 'es' ? "Luz ☀️" : "Light ☀️") 
                      : (language === 'es' ? "Oscuro 🌙" : "Dark 🌙")}
                  </strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" onClick={toggleLanguage} type="button">
              <div className="menu-item-left">
                <FaGlobe className="menu-icon text-blue" />
                <span>
                  {language === 'es' ? "Idioma" : "Language"}:{" "}
                  <strong>
                    {language === 'es' ? "Español 🇪🇸" : "English 🇺🇸"}
                  </strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" type="button">
              <div className="menu-item-left">
                <FaBell className="menu-icon text-yellow" />
                <span>{language === 'es' ? "Notificaciones" : "Notifications"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button className="menu-item" type="button">
              <div className="menu-item-left">
                <FaLock className="menu-icon text-gray" />
                <span>{language === 'es' ? "Privacidad" : "Privacy"}</span>
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

            <button className="menu-item" type="button">
              <div className="menu-item-left">
                <FaFileAlt className="menu-icon text-purple" />
                <span>{language === 'es' ? "Política de privacidad" : "Privacy policy"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* MODAL: Editar Nombre */}
        {isEditingName && (
          <div className="modal-overlay" onClick={() => setIsEditingName(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Editar Nombre" : "Edit Name"}</h2>
              <form onSubmit={handleSaveName}>
                <input 
                  type="text" 
                  className="modal-input"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Tu nombre" 
                />
                <div className="modal-actions">
                  <button type="button" className="modal-cancel-btn" onClick={() => setIsEditingName(false)}>
                    {language === 'es' ? "Cancelar" : "Cancel"}
                  </button>
                  <button type="submit" className="modal-save-btn">
                    {language === 'es' ? "Guardar" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Editar Descripción */}
        {isEditingDesc && (
          <div className="modal-overlay" onClick={() => setIsEditingDesc(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Actualizar Descripción" : "Update Description"}</h2>
              <form onSubmit={handleSaveDesc}>
                <textarea 
                  className="modal-textarea"
                  rows="4"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={language === 'es' ? "Escribe algo sobre ti..." : "Write something about yourself..."} 
                />
                <div className="modal-actions">
                  <button type="button" className="modal-cancel-btn" onClick={() => setIsEditingDesc(false)}>
                    {language === 'es' ? "Cancelar" : "Cancel"}
                  </button>
                  <button type="submit" className="modal-save-btn">
                    {language === 'es' ? "Guardar" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Cambio de Foto */}
        {isPhotoModalOpen && (
          <div className="modal-overlay" onClick={() => setIsPhotoModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Cambiar Foto de Perfil" : "Change Profile Photo"}</h2>
              <div className="modal-options">
                <label className="modal-save-btn" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
                  {language === 'es' ? "Subir desde el dispositivo" : "Upload from device"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={handlePhotoChange} 
                  />
                </label>
                <button type="button" className="modal-cancel-btn" onClick={() => setIsPhotoModalOpen(false)}>
                  {language === 'es' ? "Cancelar" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Profile;