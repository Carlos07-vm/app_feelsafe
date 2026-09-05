// =========================================================
// FEELSAFE - PANTALLA DE PERFIL DE USUARIO
// =========================================================
import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { translations } from "../constants/translations";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

// --- FIREBASE ---
import {
  signOut,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

// --- ICONOS ---
import {
  FaUserEdit,
  FaCamera,
  FaPalette,
  FaGlobe,
  FaBell,
  FaLock,
  FaHeart,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaTrash,
  FaImage,
  FaEye,
  FaTimes,
  FaCheck,
  FaKey,
  FaDownload,
  FaShieldAlt,
  FaCopy,
  FaRedo,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
} from "react-icons/fa";

/**
 * Comprime imágenes antes de guardarlas en Firestore.
 */
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

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
};

const DAILY_REFLECTIONS = [
  {
    quote: "La paz mental llega cuando aceptas lo que no puedes controlar y te enfocas con cariño en lo que sí.",
    theme: "Aceptación y Calma",
  },
  {
    quote: "Cada emoción que sientes tiene un mensaje para ti. No la reprimas, escúchala y abrázala con amabilidad.",
    theme: "Autocompasión",
  },
  {
    quote: "No necesitas tener todo resuelto para ser digno de tranquilidad y descanso el día de hoy.",
    theme: "Bienestar Emocional",
  },
  {
    quote: "Pedir ayuda no es señal de debilidad; es uno de los actos de mayor valentía y amor propio que existen.",
    theme: "Resiliencia",
  },
  {
    quote: "Tómate tu tiempo. Tu proceso no tiene que parecerse al de nadie más para ser valioso y hermoso.",
    theme: "Paciencia Contigo",
  },
];

function Profile() {
  const {
    user,
    updateUserProfile,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    testNotificationSystem,
  } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.es;

  // Referencias para fotos
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Estados visuales y de datos
  const [profileImage, setProfileImage] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Modales de apartados
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Estados de formularios
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Notificaciones interactivas
  const [notifEmotions, setNotifEmotions] = useState(
    () => localStorage.getItem("notif_emotions") !== "false"
  );
  const [notifMessages, setNotifMessages] = useState(
    () => localStorage.getItem("notif_messages") !== "false"
  );
  const [notifDailyQuotes, setNotifDailyQuotes] = useState(
    () => localStorage.getItem("notif_daily_quotes") !== "false"
  );

  // Privacidad interactiva
  const [shareEmotionsWithSpecialists, setShareEmotionsWithSpecialists] = useState(
    () => localStorage.getItem("privacy_share_emotions") !== "false"
  );
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Cita interactiva
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const [copiedReflection, setCopiedReflection] = useState(false);

  // Feedback y estado
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const currentPhoto =
      user?.photoURL || user?.foto || user?.fotoPerfil || savedImage || "";
    setProfileImage(currentPhoto);
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || user?.descripcion || "");
  }, [user]);

  /**
   * Sincroniza foto en chats activos
   */
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
      console.error("Error sincronizando en chats:", err);
    }
  };

  /**
   * Procesa la imagen seleccionada
   */
  const handleProcessFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

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
      if (auth.currentUser)
        await updateProfile(auth.currentUser, { photoURL: base64 });

      await syncPhotoInConversations(
        base64,
        user?.displayName || user?.nombre
      );

      setShowPhotoMenu(false);
      setStatusMessage(
        language === "es"
          ? "Foto de perfil actualizada correctamente."
          : "Profile photo updated successfully."
      );
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina la foto de perfil
   */
  const handleDeletePhoto = async () => {
    try {
      setSaving(true);
      setProfileImage("");
      localStorage.removeItem("profileImage");

      await updateUserProfile({ foto: "", fotoPerfil: "", photoURL: "" });
      if (auth.currentUser)
        await updateProfile(auth.currentUser, { photoURL: "" });
      await syncPhotoInConversations(
        "",
        user?.displayName || user?.nombre
      );

      setShowPhotoMenu(false);
      setStatusMessage(
        language === "es"
          ? "Foto eliminada con éxito."
          : "Photo removed successfully."
      );
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Guarda cambios de nombre y descripción
   */
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

      if (auth.currentUser)
        await updateProfile(auth.currentUser, { displayName: cleanName });

      await syncPhotoInConversations(profileImage || "", cleanName);

      setShowEditProfile(false);
      setStatusMessage(
        language === "es"
          ? "Perfil actualizado correctamente."
          : "Profile updated successfully."
      );
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Guarda preferencias de notificaciones
   */
  const handleToggleNotif = async (type) => {
    let nextEmotions = notifEmotions;
    let nextMessages = notifMessages;
    let nextQuotes = notifDailyQuotes;

    if (type === "emotions") {
      nextEmotions = !notifEmotions;
      setNotifEmotions(nextEmotions);
      localStorage.setItem("notif_emotions", String(nextEmotions));
    } else if (type === "messages") {
      nextMessages = !notifMessages;
      setNotifMessages(nextMessages);
      localStorage.setItem("notif_messages", String(nextMessages));
    } else if (type === "quotes") {
      nextQuotes = !notifDailyQuotes;
      setNotifDailyQuotes(nextQuotes);
      localStorage.setItem("notif_daily_quotes", String(nextQuotes));
    }

    try {
      await updateUserProfile({
        notificacionesConfig: {
          registroEmocional: nextEmotions,
          mensajesEspecialista: nextMessages,
          fraseDiaria: nextQuotes,
        },
      });
    } catch (e) {
      console.warn("No se pudo sincronizar en Firestore:", e);
    }

    setStatusMessage(
      language === "es"
        ? "Preferencias de notificación guardadas."
        : "Notification preferences saved."
    );
    setTimeout(() => setStatusMessage(""), 2500);
  };

  const handleTestNotification = async () => {
    if (testNotificationSystem) {
      await testNotificationSystem();
      setStatusMessage(
        language === "es"
          ? "¡Notificación de prueba enviada con éxito!"
          : "Test notification sent successfully!"
      );
      setTimeout(() => setStatusMessage(""), 3500);
    }
  };

  /**
   * Envía correo de restablecimiento de contraseña
   */
  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    try {
      setSaving(true);
      await sendPasswordResetEmail(auth, user.email);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (err) {
      console.error("Error enviando email:", err);
      alert(
        language === "es"
          ? "No se pudo enviar el correo de restablecimiento. Intenta de nuevo más tarde."
          : "Could not send password reset email. Please try again later."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Descarga los datos de bienestar del usuario en formato JSON
   */
  const handleExportData = () => {
    try {
      const userDataExport = {
        usuario: user?.displayName || user?.nombre || "Usuario FeelSafe",
        email: user?.email,
        bienestar: user?.wellbeing || 72,
        racha: user?.streak || 0,
        fechaExportacion: new Date().toISOString(),
        emocionesRegistradas: user?.emotions || [],
        notas: user?.notes || [],
        retos: JSON.parse(localStorage.getItem("feelsafe_challenges") || "[]"),
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(userDataExport, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `FeelSafe_MisDatos_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMessage(
        language === "es"
          ? "Copia de datos descargada con éxito."
          : "Data copy downloaded successfully."
      );
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (e) {
      console.error("Error descargando datos:", e);
    }
  };

  const handleCopyQuote = () => {
    const text = `"${DAILY_REFLECTIONS[reflectionIndex].quote}" — FeelSafe`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedReflection(true);
      setTimeout(() => setCopiedReflection(false), 2000);
    }
  };

  const handleLogout = async () => {
    const confirmMsg =
      language === "es"
        ? "¿Estás seguro de que deseas cerrar sesión?"
        : "Are you sure you want to log out?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      alert(
        language === "es" ? "Error al cerrar sesión." : "Error logging out."
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg =
      language === "es"
        ? "⚠️ ADVERTENCIA: ¿Estás seguro de que deseas ELIMINAR tu cuenta permanentemente? Perderás todos tus datos y esta acción no se puede deshacer."
        : "⚠️ WARNING: Are you sure you want to permanently DELETE your account? You will lose all your data and this action cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      setSaving(true);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      navigate("/login");
    } catch (err) {
      console.error("Error eliminando cuenta:", err);
      alert(
        language === "es"
          ? "Por seguridad, debes haber iniciado sesión recientemente para eliminar tu cuenta. Cierra sesión, vuelve a entrar e inténtalo de nuevo."
          : "For security reasons, you must have logged in recently to delete your account. Please log out, log back in, and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-page">
        {/* INPUTS INVISIBLES */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            handleProcessFile(e.target.files?.[0]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={cameraInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            handleProcessFile(e.target.files?.[0]);
            if (cameraInputRef.current) cameraInputRef.current.value = "";
          }}
        />

        {/* BANNER DE ÉXITO */}
        {statusMessage && (
          <div className="profile-status-banner">
            <FaCheck /> {statusMessage}
          </div>
        )}

        {/* ================= HEADER: Portada, Avatar y Datos Básicos ================= */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>

          <div className="profile-avatar-section">
            <div
              className="profile-avatar"
              onClick={() => setShowPhotoMenu(true)}
              title={language === "es" ? "Cambiar foto" : "Change photo"}
            >
              <div className="avatar-img-container">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" />
                ) : user?.photoURL || user?.foto ? (
                  <img src={user.photoURL || user.foto} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
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
              {user?.description ||
                user?.descripcion ||
                (language === "es"
                  ? "Añade una descripción sobre ti para personalizar tu espacio de bienestar."
                  : "Add a bio about yourself to personalize your wellness profile.")}
            </p>
          </div>
        </div>

        {/* ================= ESTADÍSTICAS RÁPIDAS (Clickables para navegar) ================= */}
        <div className="profile-stats-grid">
          <div
            className="stat-box clickable-stat"
            onClick={() => navigate("/mood")}
            title={language === "es" ? "Ver registro de emociones" : "View emotion check-in"}
          >
            <span className="stat-value">{user?.streak || 0} 🔥</span>
            <span className="stat-label">
              {language === "es" ? "Días de Racha" : "Streak"}
            </span>
          </div>
          <div
            className="stat-box clickable-stat"
            onClick={() => navigate("/analysis")}
            title={language === "es" ? "Ver análisis de bienestar" : "View wellbeing analysis"}
          >
            <span className="stat-value">{user?.wellbeing || 72}% 💜</span>
            <span className="stat-label">
              {language === "es" ? "Bienestar" : "Wellbeing"}
            </span>
          </div>
          <div
            className="stat-box clickable-stat"
            onClick={() => navigate("/reports")}
            title={language === "es" ? "Ver informes y notas" : "View reports and notes"}
          >
            <span className="stat-value">{user?.notes?.length || 1} 📝</span>
            <span className="stat-label">
              {language === "es" ? "Reflexiones" : "Notes"}
            </span>
          </div>
        </div>

        {/* ================= SECCIÓN: CUENTA ================= */}
        <div className="menu-group">
          <h3 className="menu-title">
            {language === "es" ? "Cuenta" : "Account"}
          </h3>
          <div className="menu-card">
            <button
              className="menu-item"
              type="button"
              onClick={() => setShowEditProfile(true)}
            >
              <div className="menu-item-left">
                <FaUserEdit className="menu-icon text-purple" />
                <span>
                  {language === "es"
                    ? "Editar perfil y descripción"
                    : "Edit profile and bio"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            <button
              className="menu-item"
              type="button"
              onClick={() => setShowPhotoMenu(true)}
            >
              <div className="menu-item-left">
                <FaCamera className="menu-icon text-blue" />
                <span>
                  {language === "es" ? "Cambio de foto" : "Change photo"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* ================= SECCIÓN: PREFERENCIAS Y ESCENARIOS ================= */}
        <div className="menu-group">
          <h3 className="menu-title">
            {language === "es" ? "Preferencias y Ajustes" : "Preferences & Settings"}
          </h3>
          <div className="menu-card">
            {/* Alternar Tema */}
            <button className="menu-item" onClick={toggleTheme} type="button">
              <div className="menu-item-left">
                <FaPalette className="menu-icon text-orange" />
                <span>
                  {language === "es" ? "Tema visual: " : "Theme: "}
                  <strong>
                    {theme === "light"
                      ? language === "es"
                        ? "Luz ☀️"
                        : "Light ☀️"
                      : language === "es"
                      ? "Oscuro 🌙"
                      : "Dark 🌙"}
                  </strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Alternar Idioma */}
            <button
              className="menu-item"
              onClick={toggleLanguage}
              type="button"
            >
              <div className="menu-item-left">
                <FaGlobe className="menu-icon text-blue" />
                <span>
                  {language === "es" ? "Idioma: " : "Language: "}
                  <strong>
                    {language === "es" ? "Español 🇪🇸" : "English 🇺🇸"}
                  </strong>
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Notificaciones */}
            <button
              className="menu-item"
              type="button"
              onClick={() => setShowNotificationsModal(true)}
            >
              <div className="menu-item-left">
                <FaBell className="menu-icon text-yellow" />
                <span>
                  {language === "es" ? "Notificaciones y Recordatorios" : "Notifications & Reminders"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Privacidad y Seguridad */}
            <button
              className="menu-item"
              type="button"
              onClick={() => setShowPrivacyModal(true)}
            >
              <div className="menu-item-left">
                <FaLock className="menu-icon text-gray" />
                <span>
                  {language === "es" ? "Seguridad y Privacidad" : "Security & Privacy"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* ================= SECCIÓN: APLICACIÓN Y BIENESTAR ================= */}
        <div className="menu-group">
          <h3 className="menu-title">
            {language === "es" ? "Aplicación y Más" : "Application & More"}
          </h3>
          <div className="menu-card">
            {/* Cita del Día */}
            <button
              className="menu-item"
              type="button"
              onClick={() => setShowQuoteModal(true)}
            >
              <div className="menu-item-left">
                <FaHeart className="menu-icon text-pink" />
                <span>
                  {language === "es" ? "Reflexión y Cita del Día" : "Daily Reflection & Quote"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Política de Privacidad */}
            <button
              className="menu-item"
              type="button"
              onClick={() => setShowPolicyModal(true)}
            >
              <div className="menu-item-left">
                <FaFileAlt className="menu-icon text-purple" />
                <span>
                  {language === "es"
                    ? "Política de Privacidad y Compromiso"
                    : "Privacy Policy & Commitment"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              className="menu-item card-danger"
              type="button"
              onClick={handleLogout}
            >
              <div className="menu-item-left">
                <FaSignOutAlt className="menu-icon text-red" />
                <span className="text-red">
                  {language === "es" ? "Cerrar sesión" : "Log out"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Eliminar Cuenta */}
            <button
              className="menu-item card-danger"
              type="button"
              onClick={handleDeleteAccount}
              disabled={saving}
            >
              <div className="menu-item-left">
                <FaTrash className="menu-icon text-red" />
                <span className="text-red">
                  {language === "es" ? "Eliminar cuenta" : "Delete account"}
                </span>
              </div>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* ==========================================================
                                MODALES FLOTANTES 
            ========================================================== */}

        {/* MODAL 1: EDITAR PERFIL */}
        {showEditProfile && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditProfile(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === "es" ? "Editar Perfil" : "Edit Profile"}</h2>
              <form onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  className="modal-input"
                  placeholder={
                    language === "es" ? "Tu nombre completo" : "Your full name"
                  }
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder={
                    language === "es"
                      ? "Escribe una breve descripción sobre ti..."
                      : "Write a short bio..."
                  }
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowEditProfile(false)}
                  >
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? language === "es"
                        ? "Guardando..."
                        : "Saving..."
                      : language === "es"
                      ? "Guardar cambios"
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: OPCIONES DE FOTO */}
        {showPhotoMenu && (
          <div
            className="modal-overlay"
            onClick={() => setShowPhotoMenu(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === "es" ? "Cambiar foto" : "Change photo"}</h2>
              <div className="modal-options">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={saving}
                >
                  <FaCamera style={{ marginRight: "8px" }} />{" "}
                  {language === "es" ? "Tomar foto" : "Take photo"}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <FaImage style={{ marginRight: "8px" }} />{" "}
                  {language === "es" ? "Elegir de galería" : "Choose from gallery"}
                </button>

                {profileImage && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoMenu(false);
                        setShowImagePreview(true);
                      }}
                    >
                      <FaEye style={{ marginRight: "8px" }} />{" "}
                      {language === "es" ? "Ver foto" : "View photo"}
                    </button>

                    <button
                      type="button"
                      style={{ color: "#ef4444" }}
                      onClick={handleDeletePhoto}
                      disabled={saving}
                    >
                      <FaTrash style={{ marginRight: "8px" }} />{" "}
                      {language === "es" ? "Eliminar foto" : "Delete photo"}
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowPhotoMenu(false)}
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: VISTA PREVIA DE FOTO */}
        {showImagePreview && (
          <div
            className="modal-overlay"
            onClick={() => setShowImagePreview(false)}
          >
            <div
              className="image-preview-container"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={profileImage} alt="Perfil" />
              <button
                type="button"
                className="close-preview-btn"
                onClick={() => setShowImagePreview(false)}
              >
                <FaTimes style={{ marginRight: "5px" }} />{" "}
                {language === "es" ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL 4: NOTIFICACIONES Y RECORDATORIOS */}
        {showNotificationsModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowNotificationsModal(false)}
          >
            <div
              className="modal-content modal-content-wide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-icon-wrap">
                <FaBell className="modal-top-icon text-yellow" />
              </div>
              <h2>
                {language === "es"
                  ? "Notificaciones y Recordatorios"
                  : "Notifications & Reminders"}
              </h2>
              <p className="modal-subtitle">
                {language === "es"
                  ? "Personaliza cuándo deseas recibir avisos para cuidar tu rutina de bienestar."
                  : "Customize when you want to receive check-in reminders."}
              </p>

              <div className="settings-toggles-list">
                <div
                  className="toggle-setting-row"
                  onClick={() => handleToggleNotif("emotions")}
                >
                  <div className="toggle-info">
                    <strong>
                      {language === "es"
                        ? "Recordatorio de Registro Diario"
                        : "Daily Check-in Reminder"}
                    </strong>
                    <span>
                      {language === "es"
                        ? "Aviso nocturno suave para registrar cómo te sentiste hoy."
                        : "Gentle evening reminder to log your daily emotions."}
                    </span>
                  </div>
                  <button type="button" className="toggle-icon-btn">
                    {notifEmotions ? (
                      <FaToggleOn className="toggle-on" />
                    ) : (
                      <FaToggleOff className="toggle-off" />
                    )}
                  </button>
                </div>

                <div
                  className="toggle-setting-row"
                  onClick={() => handleToggleNotif("messages")}
                >
                  <div className="toggle-info">
                    <strong>
                      {language === "es"
                        ? "Mensajes de Especialistas"
                        : "Specialist Messages"}
                    </strong>
                    <span>
                      {language === "es"
                        ? "Notificarme de inmediato cuando un especialista me responda."
                        : "Notify me immediately when a specialist replies."}
                    </span>
                  </div>
                  <button type="button" className="toggle-icon-btn">
                    {notifMessages ? (
                      <FaToggleOn className="toggle-on" />
                    ) : (
                      <FaToggleOff className="toggle-off" />
                    )}
                  </button>
                </div>

                <div
                  className="toggle-setting-row"
                  onClick={() => handleToggleNotif("quotes")}
                >
                  <div className="toggle-info">
                    <strong>
                      {language === "es"
                        ? "Frase y Reto Matutino"
                        : "Morning Quote & Challenge"}
                    </strong>
                    <span>
                      {language === "es"
                        ? "Una dosis de inspiración y gratitud al iniciar el día."
                        : "A dose of gratitude and inspiration to start the day."}
                    </span>
                  </div>
                  <button type="button" className="toggle-icon-btn">
                    {notifDailyQuotes ? (
                      <FaToggleOn className="toggle-on" />
                    ) : (
                      <FaToggleOff className="toggle-off" />
                    )}
                  </button>
                </div>
              </div>

              <div className="modal-actions modal-actions-split">
                <button
                  type="button"
                  className="modal-test-btn"
                  onClick={handleTestNotification}
                >
                  <FaBell style={{ marginRight: "6px" }} />
                  {language === "es" ? "Probar Notificación" : "Test Notification"}
                </button>
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setShowNotificationsModal(false)}
                >
                  {language === "es" ? "Listo" : "Done"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: SEGURIDAD Y PRIVACIDAD */}
        {showPrivacyModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div
              className="modal-content modal-content-wide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-icon-wrap">
                <FaShieldAlt className="modal-top-icon text-purple" />
              </div>
              <h2>
                {language === "es"
                  ? "Seguridad y Privacidad"
                  : "Security & Privacy"}
              </h2>
              <p className="modal-subtitle">
                {language === "es"
                  ? "Tus datos de salud mental están protegidos y bajo tu control total."
                  : "Your mental health data is strictly protected and fully in your control."}
              </p>

              <div className="settings-toggles-list">
                {/* Cambiar / Restablecer Contraseña */}
                <div className="action-setting-row">
                  <div className="toggle-info">
                    <strong>
                      <FaKey className="mini-row-icon" />{" "}
                      {language === "es"
                        ? "Cambiar Contraseña"
                        : "Change Password"}
                    </strong>
                    <span>
                      {language === "es"
                        ? `Te enviaremos un enlace seguro a ${user?.email || "tu correo"}`
                        : `We will send a secure link to ${user?.email || "your email"}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="action-pill-btn"
                    onClick={handleSendPasswordReset}
                    disabled={saving || resetEmailSent}
                  >
                    <FaEnvelope />{" "}
                    {resetEmailSent
                      ? language === "es"
                        ? "¡Correo enviado!"
                        : "Email sent!"
                      : language === "es"
                      ? "Enviar enlace"
                      : "Send link"}
                  </button>
                </div>

                {/* Compartir datos con especialistas */}
                <div
                  className="toggle-setting-row"
                  onClick={() => {
                    const next = !shareEmotionsWithSpecialists;
                    setShareEmotionsWithSpecialists(next);
                    localStorage.setItem("privacy_share_emotions", String(next));
                    setStatusMessage(
                      language === "es"
                        ? "Preferencia de privacidad actualizada."
                        : "Privacy preference updated."
                    );
                    setTimeout(() => setStatusMessage(""), 2500);
                  }}
                >
                  <div className="toggle-info">
                    <strong>
                      {language === "es"
                        ? "Historial Visible para Especialistas"
                        : "Share History with Specialists"}
                    </strong>
                    <span>
                      {language === "es"
                        ? "Permite que los especialistas con quienes chatees vean tus registros recientes para un mejor acompañamiento."
                        : "Allow specialists you chat with to see recent mood logs for better support."}
                    </span>
                  </div>
                  <button type="button" className="toggle-icon-btn">
                    {shareEmotionsWithSpecialists ? (
                      <FaToggleOn className="toggle-on" />
                    ) : (
                      <FaToggleOff className="toggle-off" />
                    )}
                  </button>
                </div>

                {/* Descargar mis datos */}
                <div className="action-setting-row">
                  <div className="toggle-info">
                    <strong>
                      <FaDownload className="mini-row-icon" />{" "}
                      {language === "es"
                        ? "Descargar Mis Datos (JSON)"
                        : "Download My Data (JSON)"}
                    </strong>
                    <span>
                      {language === "es"
                        ? "Obtén una copia completa de tus registros de bienestar y reflexiones."
                        : "Get a full copy of all your wellbeing records and reflections."}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="action-pill-btn secondary"
                    onClick={handleExportData}
                  >
                    <FaDownload /> {language === "es" ? "Descargar" : "Download"}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setShowPrivacyModal(false)}
                >
                  {language === "es" ? "Cerrar" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 6: CITA Y REFLEXIÓN DEL DÍA */}
        {showQuoteModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowQuoteModal(false)}
          >
            <div
              className="modal-content modal-content-wide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-icon-wrap">
                <FaHeart className="modal-top-icon text-pink" />
              </div>
              <span className="quote-badge-theme">
                {DAILY_REFLECTIONS[reflectionIndex].theme}
              </span>
              <h2>
                {language === "es"
                  ? "Reflexión del Día"
                  : "Daily Reflection"}
              </h2>

              <div className="quote-display-box">
                <p className="quote-main-text">
                  "{DAILY_REFLECTIONS[reflectionIndex].quote}"
                </p>
                <span className="quote-author-tag">— FeelSafe Bienestar</span>
              </div>

              <div className="quote-actions-row">
                <button
                  type="button"
                  className="quote-sec-btn"
                  onClick={() =>
                    setReflectionIndex(
                      (prev) => (prev + 1) % DAILY_REFLECTIONS.length
                    )
                  }
                >
                  <FaRedo />{" "}
                  {language === "es" ? "Otra reflexión" : "Another quote"}
                </button>

                <button
                  type="button"
                  className="quote-sec-btn"
                  onClick={handleCopyQuote}
                >
                  {copiedReflection ? (
                    <>
                      <FaCheck color="#10B981" />{" "}
                      {language === "es" ? "¡Copiada!" : "Copied!"}
                    </>
                  ) : (
                    <>
                      <FaCopy /> {language === "es" ? "Copiar" : "Copy"}
                    </>
                  )}
                </button>
              </div>

              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setShowQuoteModal(false)}
                >
                  {language === "es" ? "Cerrar" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 7: POLÍTICA DE PRIVACIDAD */}
        {showPolicyModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowPolicyModal(false)}
          >
            <div
              className="modal-content modal-content-wide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-icon-wrap">
                <FaFileAlt className="modal-top-icon text-purple" />
              </div>
              <h2>
                {language === "es"
                  ? "Compromiso de Privacidad"
                  : "Privacy Commitment"}
              </h2>
              <p className="modal-subtitle">
                {language === "es"
                  ? "En FeelSafe, tu tranquilidad y la confidencialidad de tus emociones son nuestra máxima prioridad."
                  : "At FeelSafe, your peace of mind and emotional confidentiality are our highest priority."}
              </p>

              <div className="policy-points-list">
                <div className="policy-point-item">
                  <span className="policy-num">1</span>
                  <div>
                    <strong>
                      {language === "es"
                        ? "Confidencialidad Médica y Emocional"
                        : "Medical & Emotional Confidentiality"}
                    </strong>
                    <p>
                      {language === "es"
                        ? "Tus mensajes y consultas con especialistas son privados entre tú y el profesional seleccionado."
                        : "Your messages with specialists are strictly private between you and the professional."}
                    </p>
                  </div>
                </div>

                <div className="policy-point-item">
                  <span className="policy-num">2</span>
                  <div>
                    <strong>
                      {language === "es"
                        ? "Sin Venta de Datos ni Publicidad"
                        : "No Data Selling or Invasive Ads"}
                    </strong>
                    <p>
                      {language === "es"
                        ? "Nunca comercializamos tu información personal ni la compartimos con anunciantes de terceros."
                        : "We never commercialize your personal information or share it with third-party advertisers."}
                    </p>
                  </div>
                </div>

                <div className="policy-point-item">
                  <span className="policy-num">3</span>
                  <div>
                    <strong>
                      {language === "es"
                        ? "Derecho al Olvido Total"
                        : "Right to Full Erasure"}
                    </strong>
                    <p>
                      {language === "es"
                        ? "Puedes eliminar tu cuenta en cualquier momento desde esta misma pantalla y todos tus datos serán borrados permanentemente."
                        : "You can delete your account at any time and all your data will be permanently wiped."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setShowPolicyModal(false)}
                >
                  {language === "es" ? "Entendido" : "Understood"}
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
