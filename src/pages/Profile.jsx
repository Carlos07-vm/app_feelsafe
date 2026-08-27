// =========================================================
// IMPORTACIONES PRINCIPALES
// =========================================================
import "../styles/Profile.css"; // Estilos específicos de la pantalla de perfil
import MainLayout from "../layouts/MainLayout"; // Contenedor principal de la app (Sidebar, Navbar, etc.)
import { useApp } from "../context/AppContext"; // Contexto global (estado del usuario, tema, idioma)
import { translations } from "../constants/translations"; // Diccionario para múltiples idiomas
import { useNavigate } from "react-router-dom"; // Hook para redireccionar rutas
import { useState, useRef, useEffect } from "react"; // Hooks básicos de React

// --- FIREBASE ---
import { signOut, updateProfile, deleteUser } from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// --- ICONOS ---
import { 
  FaUserEdit, FaCamera, FaPen, FaPalette, FaGlobe, FaBell, FaLock, 
  FaHeart, FaFileAlt, FaUser, FaSignOutAlt, FaTrash, 
  FaImage, FaEye, FaTimes, FaCheck
} from "react-icons/fa";

// =========================================================
// UTILIDADES
// =========================================================

/**
 * Función para comprimir imágenes antes de subirlas a Firebase.
 * Evita que la base de datos se llene con fotos muy pesadas.
 * @param {File} file - El archivo de imagen original.
 * @param {number} maxWidth - Ancho o alto máximo permitido (ej. 400px).
 * @param {number} quality - Calidad de compresión (0.0 a 1.0).
 * @returns {Promise<string>} - Promesa que resuelve a una cadena Base64 con la imagen comprimida.
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

        // Mantener la proporción original si la imagen excede el tamaño máximo
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        // Dibujar la nueva imagen redimensionada en el canvas
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir el canvas a formato Base64 (texto)
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
};

// =========================================================
// COMPONENTE PRINCIPAL: PROFILE
// =========================================================

function Profile() {
  // Extraemos variables y funciones del contexto global
  const { user, updateUserProfile, theme, toggleTheme, language, toggleLanguage } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.es; // Diccionario dinámico

  // ==================== ESTADOS Y REFERENCIAS ====================
  // Referencias a los inputs HTML invisibles para subir archivos
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Estados visuales y de datos
  const [profileImage, setProfileImage] = useState(""); // Foto actual en pantalla
  const [showPhotoMenu, setShowPhotoMenu] = useState(false); // Modal de opciones de foto
  const [showImagePreview, setShowImagePreview] = useState(false); // Modal para ver foto en grande
  const [showEditProfile, setShowEditProfile] = useState(false); // Modal para editar datos
  
  // Estados para los formularios
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  // Estados de retroalimentación de la interfaz
  const [statusMessage, setStatusMessage] = useState(""); // Mensajes de éxito ("Guardado")
  const [saving, setSaving] = useState(false); // Bloquea botones mientras carga Firebase

  // ==================== EFECTOS SECUNDARIOS (useEffect) ====================
  // Se ejecuta al cargar el componente o cuando los datos del 'user' global cambian
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const currentPhoto = user?.photoURL || user?.foto || user?.fotoPerfil || savedImage || "";
    setProfileImage(currentPhoto);
    setEditName(user?.displayName || user?.nombre || "");
    setEditDescription(user?.description || user?.descripcion || "");
  }, [user]);

  // ==================== FUNCIONES DE LÓGICA Y FIREBASE ====================

  /**
   * Sincroniza la foto y el nombre nuevo del usuario en todas 
   * sus conversaciones activas con los especialistas.
   */
  const syncPhotoInConversations = async (photoBase64, name) => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "conversaciones_especialistas"), where("usuarioId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      const updates = snapshot.docs.map((docSnap) => {
        return updateDoc(doc(db, "conversaciones_especialistas", docSnap.id), {
          usuarioFoto: photoBase64,
          ...(name ? { usuarioNombre: name } : {}), // Solo actualiza el nombre si existe
        });
      });
      await Promise.all(updates); // Ejecuta todas las actualizaciones en paralelo
    } catch (err) {
      console.error("Error sincronizando en chats:", err);
    }
  };

  /**
   * Procesa la imagen seleccionada, la comprime, la guarda en Firebase y actualiza la app.
   */
  const handleProcessFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return; // Solo aceptar imágenes
    
    try {
      setSaving(true);
      // 1. Comprimir imagen
      const base64 = await compressImage(file, 400, 0.75);
      
      // 2. Actualizar estado local y LocalStorage
      setProfileImage(base64);
      localStorage.setItem("profileImage", base64);

      // 3. Actualizar en Firestore (Base de datos) y en Firebase Auth
      await updateUserProfile({ foto: base64, fotoPerfil: base64, photoURL: base64 });
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: base64 });
      
      // 4. Sincronizar en los chats
      await syncPhotoInConversations(base64, user?.displayName || user?.nombre);

      // 5. Cerrar modal y mostrar éxito
      setShowPhotoMenu(false);
      setStatusMessage(language === 'es' ? "Foto actualizada correctamente." : "Photo updated successfully.");
      setTimeout(() => setStatusMessage(""), 3500); // Borrar mensaje a los 3.5s
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina la foto de perfil actual, devolviendo al usuario al icono por defecto.
   */
  const handleDeletePhoto = async () => {
    try {
      setSaving(true);
      setProfileImage("");
      localStorage.removeItem("profileImage");

      await updateUserProfile({ foto: "", fotoPerfil: "", photoURL: "" });
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: "" });
      await syncPhotoInConversations("", user?.displayName || user?.nombre);

      setShowPhotoMenu(false);
      setStatusMessage(language === 'es' ? "Foto eliminada." : "Photo deleted.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Guarda los cambios del formulario de "Nombre" y "Descripción" en Firebase.
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault(); // Evita que la página recargue al enviar el form
    if (!editName.trim()) return;

    try {
      setSaving(true);
      const cleanName = editName.trim();
      const cleanDesc = editDescription.trim();

      // Guardar en la colección del usuario
      await updateUserProfile({
        displayName: cleanName, nombre: cleanName,
        description: cleanDesc, descripcion: cleanDesc,
      });

      // Guardar en la autenticación global de Firebase
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: cleanName });
      
      // Sincronizar chats
      await syncPhotoInConversations(profileImage || "", cleanName);

      setShowEditProfile(false);
      setStatusMessage(language === 'es' ? "Perfil actualizado correctamente." : "Profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cierra la sesión del usuario actual de manera segura.
   */
  const handleLogout = async () => {
    const confirmMsg = language === 'es' ? "¿Estás seguro de que deseas cerrar sesión?" : "Are you sure you want to log out?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await signOut(auth);
      navigate("/login"); // Redirección a la pantalla de login
    } catch {
      alert(language === 'es' ? "Error al cerrar sesión." : "Error logging out.");
    }
  };

  /**
   * Elimina permanentemente la cuenta de Firebase y sus datos.
   */
  const handleDeleteAccount = async () => {
    const confirmMsg = language === 'es' 
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
      // Firebase requiere que el inicio de sesión sea reciente para borrar cuentas
      alert(language === 'es' 
        ? "Por seguridad, debes haber iniciado sesión recientemente para eliminar tu cuenta. Cierra sesión, vuelve a entrar e inténtalo de nuevo." 
        : "For security reasons, you must have logged in recently to delete your account. Please log out, log back in, and try again.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // INTERFAZ DE USUARIO (RENDER)
  // =========================================================

  return (
    <MainLayout>
      <div className="profile-page">
        
        {/* INPUTS INVISIBLES: Se disparan mediante referencias (ref) desde otros botones */}
        <input 
          type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} 
          onChange={(e) => { handleProcessFile(e.target.files?.[0]); if (fileInputRef.current) fileInputRef.current.value = ""; }} 
        />
        <input 
          type="file" accept="image/*" capture="user" ref={cameraInputRef} style={{ display: "none" }} 
          onChange={(e) => { handleProcessFile(e.target.files?.[0]); if (cameraInputRef.current) cameraInputRef.current.value = ""; }} 
        />

        {/* BANNER DE NOTIFICACIONES (Éxito) */}
        {statusMessage && (
          <div className="profile-status" style={{ marginBottom: "15px" }}>
            <FaCheck style={{ marginRight: '8px' }}/> {statusMessage}
          </div>
        )}
        
        {/* ================= HEADER: Portada, Avatar y Datos Básicos ================= */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={() => setShowPhotoMenu(true)}>
              <div className="avatar-img-container">
                {/* Lógica para mostrar la foto Base64, foto externa (Google) o Icono */}
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" />
                ) : user?.photoURL || user?.foto ? (
                  <img src={user.photoURL || user.foto} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder"><FaUser /></div>
                )}
              </div>
              {/* Botoncito rosado flotante de cámara */}
              <div className="camera-btn"><FaCamera /></div>
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

        {/* ================= ESTADÍSTICAS RÁPIDAS (Grid superior) ================= */}
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

        {/* ================= SECCIÓN: CUENTA ================= */}
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

        {/* ================= SECCIÓN: ESCENARIOS (Configuración visual) ================= */}
        <div className="menu-group">
          <h3 className="menu-title">{language === 'es' ? "Escenarios" : "Settings"}</h3>
          <div className="menu-card">
            
            {/* Botón que alterna el Modo Oscuro global */}
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

            {/* Botón que alterna el Idioma global */}
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

        {/* ================= SECCIÓN: APLICACIÓN (Acciones finales) ================= */}
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

            {/* Cerrar Sesión */}
            <button className="menu-item card-danger" type="button" onClick={handleLogout}>
              <div className="menu-item-left">
                <FaSignOutAlt className="menu-icon text-red" />
                <span className="text-red">{language === 'es' ? "Cerrar sesión" : "Log out"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

            {/* Eliminar Cuenta */}
            <button className="menu-item card-danger" type="button" onClick={handleDeleteAccount} disabled={saving}>
              <div className="menu-item-left">
                <FaTrash className="menu-icon text-red" />
                <span className="text-red">{language === 'es' ? "Eliminar cuenta" : "Delete account"}</span>
              </div>
              <span className="menu-arrow">›</span>
            </button>

          </div>
        </div>

        {/* ==========================================================
                                MODALES FLOTANTES 
            ========================================================== */}
        
        {/* MODAL 1: EDITAR PERFIL (Nombre y descripción) */}
        {showEditProfile && (
          <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
            {/* stopPropagation evita que al hacer clic dentro del formulario, se cierre el modal */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{language === 'es' ? "Editar Perfil" : "Edit Profile"}</h2>
              <form onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  className="modal-input"
                  placeholder={language === 'es' ? "Tu nombre completo" : "Your full name"}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder={language === 'es' ? "Escribe una breve descripción sobre ti..." : "Write a short bio..."}
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

        {/* MODAL 2: OPCIONES DE FOTO DE PERFIL (Cámara, galería, ver, borrar) */}
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
                
                {/* Opciones que solo aparecen si ya hay una foto cargada */}
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

        {/* MODAL 3: VISTA PREVIA DE FOTO (Ver foto en grande) */}
        {showImagePreview && (
          <div className="modal-overlay" onClick={() => setShowImagePreview(false)}>
            <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={profileImage} alt="Perfil" />
              <button type="button" className="close-preview-btn" onClick={() => setShowImagePreview(false)}>
                <FaTimes style={{ marginRight: "5px" }} /> {language === 'es' ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Profile;