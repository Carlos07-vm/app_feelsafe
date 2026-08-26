import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { 
  FaUser, FaCamera, FaPen, FaPalette, FaGlobe, FaBell, FaLock, 
  FaHeart, FaFileAlt, FaInfoCircle, FaSignOutAlt, FaTrash, FaChevronRight
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
    noDesc: "Añade una descripción sobre ti para personalizar tu perfil."
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
    noDesc: "Add a description about yourself to customize your profile."
  }
};

function Profile() {
  const { 
    user, updateUserProfile, theme, toggleTheme, language, toggleLanguage 
  } = useApp();
  
  const navigate = useNavigate();

  // 2. ACTIVAMOS EL DICCIONARIO (Dependiendo del idioma seleccionado)
  const t = translations[language] || translations.es;

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
    if (savedImage) setProfileImage(savedImage);
    else setProfileImage(user?.photoURL || user?.foto || "");
    
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || "");
  }, [user]);

  useEffect(() => {
    if (profileImage) localStorage.setItem("profileImage", profileImage);
  }, [profileImage]);

  const handleLogout = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cerrar sesión?")) return;
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
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
      setShowPhotoMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    setProfileImage("");
    updateUserProfile({ foto: "", photoURL: "" });
    localStorage.removeItem("profileImage");
    setShowPhotoMenu(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    await updateUserProfile({
      displayName: editName.trim(),
      nombre: editName.trim(),
      description: editDescription.trim(),
    });
    setShowEditProfile(false);
  };

  return (
    <MainLayout>
      <div className="profile-page">
        
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
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <button className="camera-btn" type="button" onClick={(e) => { e.stopPropagation(); setShowPhotoMenu(true); }}>
                <FaCamera />
              </button>
            </div>
          </div>

          <div className="profile-header-info">
            <h2>{user?.displayName || user?.nombre || "Usuario"}</h2>
            <span className="user-email">{user?.email || ""}</span>
            <p className="profile-description">
              {user?.description || t.noDesc}
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

      </div>
    </MainLayout>
  );
}

export default Profile;