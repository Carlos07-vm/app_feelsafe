import "../styles/Profile.css";
import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { storage} from "../services/firebase";
import { db } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
function Profile() {
  const  { user, setUser } = useApp();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
 
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);


  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };


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

const handleSelectPhoto = async (e) => {

  const file = e.target.files[0];

  if (!file) return;
  const reader = new FileReader();

 reader.onload = async () => {
    const image = reader.result;

// Cambia la imagen en Perfil
    setProfileImage(image);

 // Actualizar usuario global
     setUser({
      ...user,
      foto: image,
      photoURL: image
    });;

    // Guardar en Firestore
    await updateDoc(
      doc(db, "users", user.uid),
      {
        foto: image,
        photoURL: image
      }
    );

     // Guardar localmente como respaldo
    localStorage.setItem(
      "profileImage",
      image
    );

     };


  reader.readAsDataURL(file);

};
    
  const handleDeletePhoto = () => {
    const confirmDelete = window.confirm(
       "¿Eliminar la foto de perfil?"
    );

    if (!confirmDelete) return;
    setProfileImage(null);
    localStorage.removeItem("profileImage");
    setShowPhotoMenu(false);
    
};

const openGallery = () => {

  fileInputRef.current.click();
  setShowPhotoMenu(false);

};

const openCamera = () => {
   cameraInputRef.current.click()
     setShowPhotoMenu(false);

};

const viewPhoto = () => {
   if(profileImage){
     setShowPhotoMenu(false);
     setShowImagePreview(true);
     }else{
      alert("No tienes una foto de perfil");
       }

};





  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

  }, []);

  return (
    <MainLayout>
      <div className="profile-page">

        {/* Encabezado */}
        <div className="profile-header">

          <div  className="profile-avatar"
          onClick={() => setShowPhotoMenu(true)}
          >

            <div className="avatar">
             {profileImage ? (

            <img
                src={profileImage}
                alt="Perfil"
            />

             ) : (

            user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Perfil"
              />
            ):(
               "👤"
            )


             )}

             </div>

              <button
                  className="camera-btn"
                  onClick={(e) => {
                     e.stopPropagation();
                      setShowPhotoMenu(true);
                      }}
              >
                  📷
              </button>

              

          </div>
          

          <h2>{user?.displayName || user?.nombre}</h2>

          <p className="profile-description">
            {user?.description || "Añade una descripción sobre ti."}
          </p>

        </div>

        {/* Información */}
        <div className="profile-info-card">

          <div className="info-item">
            <span>😊 Estado</span>

            <div
              className="mood-badge"
              style={{
                backgroundColor: getMoodColor(user?.currentMood),
              }}
            >
              {user?.currentMood}
            </div>
          </div>

          <div className="info-item">
            <span>🎂 Edad</span>
            <strong>{user?.profile?.age} años</strong>
          </div>

          <div className="info-item">
            <span>💚 Bienestar</span>
            <strong>{user?.wellbeing}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${user?.wellbeing}%`,
              }}
            ></div>
          </div>

        </div>

        {/* Estadísticas */}

        <div className="stats">

          <div className="stat-card">
            <h3>{user?.streak}</h3>
            <p>🔥 Racha</p>
          </div>

          <div className="stat-card">
            <h3>{user?.notes?.length || 0}</h3>
            <p>📝 Notas</p>
          </div>

          <div className="stat-card">
            <h3>{user?.wellbeing}%</h3>
            <p>💚 Salud</p>
          </div>

        </div>

        {/* Opciones */}

        <div className="profile-menu">

          <div className="menu-title">
            Cuenta
          </div>

          <button className="menu-item">
            <span>👤 Editar perfil</span>
            <span>›</span>
          </button>

          <button className="menu-item"
           onClick={() => setShowPhotoMenu(true)}>
            <span>📷 Foto de perfil</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>✍️ Cambiar descripción</span>
            <span>›</span>
          </button>

        </div>

        <div className="profile-menu">

          <div className="menu-title">
            Configuración
          </div>

          <button className="menu-item">
            <span>🎨 Tema</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>🌎 Idioma</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>🔔 Notificaciones</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>🔒 Privacidad</span>
            <span>›</span>
          </button>

        </div>

        <div className="profile-menu">

          <div className="menu-title">
            Aplicación
          </div>

          <button className="menu-item">
            <span>💙 Frase del día</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>📄 Política de privacidad</span>
            <span>›</span>
          </button>

          <button className="menu-item">
            <span>ℹ️ Acerca de FeelSafe</span>
            <span>›</span>
          </button>

        </div>

        {/* Última nota */}

        {user?.notes?.length > 0 && (

          <div className="last-note">

            <h3>📝 Última nota</h3>

            <p>
              {user.notes[user.notes.length - 1].text}
            </p>

          </div>

        )}

        {/* Botones */}

        <div className="danger-zone">

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>

          <button className="delete-btn">
            🗑 Eliminar cuenta
          </button>

        </div>

      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleSelectPhoto}
        hidden
      />
      {showPhotoMenu && (

<div className="modal-overlay">

  <div className="modal">

    <h2>Cambiar foto de perfil</h2>

    <button
      className="menu-item"
      onClick={openGallery}
    >
      <span>🖼 Elegir de la galería</span>
      <span>›</span>
    </button>

    <button
      className="menu-item"
    >
      <span>📷 Tomar foto</span>
      <span>›</span>
    </button>

    <button
      className="menu-item"
      onClick={viewPhoto}
    >
      <span>👁 Ver foto</span>
      <span>›</span>
    </button>

    <button
      className="menu-item"
      onClick={handleDeletePhoto}
    >
      <span>🗑 Eliminar foto</span>
      <span>›</span>
    </button>

    <button
      className="menu-item"
      onClick={() => setShowPhotoMenu(false)}
    >
      <span>❌ Cancelar</span>
    </button>

  </div>

</div>

)}
      {showImagePreview && (
        <div className="modal-overlay">
           <div className="image-preview">

             <img src={profileImage}  alt="Foto de perfil"
    />
          <button className="close-preview"
      onClick={() => setShowImagePreview(false)}
    > ❌ Cerrar
           </button>
        </div>
       </div>

      )}

    </MainLayout>
  );
}

export default Profile;