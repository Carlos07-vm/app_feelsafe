import "../styles/Sos.css";
import MainLayout from "../layouts/MainLayout"; 
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext"; 

import {
  FaPhoneAlt,
  FaHeart,
  FaUserFriends,
  FaHandsHelping,
  FaWhatsapp,
  FaPlus,
  FaTimes,
  FaTrash
} from "react-icons/fa";

// Métodos específicos de Firestore para operar con la base de datos
import { 
  collection,
  addDoc,
  deleteDoc,    
  doc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../services/firebase";
import BreathingModal from "../components/BreathingModal";

function SOS() {
  const { user } = useApp(); 
  const navigate = useNavigate();
  const [status, setStatus] = useState("Selecciona una opción para recibir ayuda inmediata.");

  // Estados para manejar el comportamiento del modal y los datos de Firebase
  const [showContactModal, setShowContactModal] = useState(false); 
  const [showBreathing, setShowBreathing] = useState(false);
  const [contacts, setContacts] = useState([]); 
  const [loadingContacts, setLoadingContacts] = useState(false); 
  
  const [isAddingContact, setIsAddingContact] = useState(false); 
  const [newName, setNewName] = useState(""); 
  const [newPhone, setNewPhone] = useState(""); 

  // ==================== LÓGICA DE FIREBASE (TIEMPO REAL) ====================

  useEffect(() => {
    if (!user?.uid || !showContactModal) return;

    setLoadingContacts(true);
    const contactsRef = collection(db, "usuarios", user.uid, "contactos_emergencia");

    const unsubscribe = onSnapshot(
      contactsRef,
      (snapshot) => {
        const contactList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setContacts(contactList);
        setLoadingContacts(false);
      },
      (error) => {
        console.error("Error escuchando contactos en tiempo real:", error);
        setStatus("No se pudieron cargar los contactos de emergencia.");
        setLoadingContacts(false);
      }
    );

    return () => unsubscribe();
  }, [showContactModal, user?.uid]);

  const handleAddContact = async (e) => {
    e.preventDefault(); 
    const cleanName = newName.trim().slice(0, 100);
    const cleanPhone = newPhone.trim().slice(0, 40);
    if (!cleanName || !cleanPhone || !user?.uid) return; 
    
    try {
      setLoadingContacts(true);
      const contactsRef = collection(db, "usuarios", user.uid, "contactos_emergencia");
      
      // addDoc genera automáticamente un ID único para este nuevo contacto
      await addDoc(contactsRef, { 
         nombre: cleanName, 
         telefono: cleanPhone, 
        fechaCreacion: new Date().toISOString() 
      });
      
      setNewName(""); 
      setNewPhone(""); 
      setIsAddingContact(false); 
      
      setStatus("Contacto guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el contacto:", error);
      setStatus("No se pudo guardar el contacto. Inténtalo de nuevo.");
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("¿Estás seguro de eliminar este contacto?")) return;
    
    try {
      setLoadingContacts(true);
      // doc() crea una referencia exacta al documento usando su ID único
      const contactRef = doc(db, "usuarios", user.uid, "contactos_emergencia", contactId);
      await deleteDoc(contactRef); 
      setStatus("Contacto eliminado.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      setStatus("No se pudo eliminar el contacto. Inténtalo de nuevo.");
    } finally {
      setLoadingContacts(false);
    }
  };

  // ==================== ACCIONES DEL DISPOSITIVO ====================

  const handleNormalCall = (phone) => {
    // 'tel:' invoca la aplicación nativa de llamadas del sistema operativo
    window.location.href = `tel:${phone}`; 
    setStatus(`Llamando a ${phone}...`);
  };

  const handleWhatsAppCall = (phone) => {
    // Expresión regular: Elimina espacios, guiones o símbolos para evitar errores en la URL de WhatsApp
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      setStatus("Número de teléfono inválido.");
      return;
    }
    window.open(`https://wa.me/${cleanPhone}`, "_blank", "noopener,noreferrer"); 
    setStatus(`Abriendo WhatsApp...`);
  };

  const handleAction = (type) => {
    switch (type) {
      case "contact":
        setShowContactModal(true); 
        setStatus("Abriendo lista de contactos de emergencia...");
        break;
      case "breath":
        setShowBreathing(true);
        setStatus("Sigue el ritmo de la respiración guiada.");
        break;
      case "talk":
        navigate("/specialists");
        break;
      default:
        setStatus("Sigue los consejos y cuida tu ritmo.");
        break;
    }
  };

  // ==================== INTERFAZ ====================
  return (
    <MainLayout>
      <div className="sos-container">
        <div className="sos-header">
          <h1 className="page-title">🆘 Centro SOS</h1>
          <p className="page-description">Si estás pasando por un momento difícil, no estás solo. FeelSafe está aquí para ayudarte.</p>
        </div>

        <div className="sos-grid">
          <div className="sos-card card-red">
            <div className="sos-icon-wrapper"><FaPhoneAlt className="sos-icon" /></div>
            <h2>Llamar a un contacto</h2>
            <p className="sos-text">Contacta rápidamente a un familiar o persona de confianza.</p>
            <button className="sos-btn" type="button" onClick={() => handleAction("contact")}>Contactar</button>
          </div>

          <div className="sos-card card-blue">
            <div className="sos-icon-wrapper"><FaHeart className="sos-icon" /></div>
            <h2>Respira conmigo</h2>
            <p className="sos-text">Inicia un ejercicio guiado para disminuir la ansiedad.</p>
            <button className="sos-btn" type="button" onClick={() => handleAction("breath")}>Comenzar</button>
          </div>

          <div className="sos-card card-purple">
            <div className="sos-icon-wrapper"><FaUserFriends className="sos-icon" /></div>
            <h2>Habla con alguien</h2>
            <p className="sos-text">Compartir cómo te sientes puede ayudarte mucho.</p>
            <button className="sos-btn" type="button" onClick={() => handleAction("talk")}>Ver recomendaciones</button>
          </div>

          <div className="sos-card card-green">
            <div className="sos-icon-wrapper"><FaHandsHelping className="sos-icon" /></div>
            <h2>Consejos rápidos</h2>
            <ul className="sos-list">
              <li>Respira lentamente.</li>
              <li>Bebe agua.</li>
              <li>Sal a caminar.</li>
              <li>Escucha música relajante.</li>
            </ul>
          </div>
        </div>

        <div className="sos-status-banner">
          <p>{status}</p>
        </div>

        {showContactModal && (
          <div 
            className="sos-modal-overlay" 
            onClick={() => { setShowContactModal(false); setIsAddingContact(false); }}
          >
            {/* e.stopPropagation() evita que el clic en el contenido cierre el modal (evento del overlay superior) */}
             <div
               className="sos-modal-content"
               role="dialog"
               aria-modal="true"
               aria-labelledby="sos-modal-title"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="sos-modal-header">
                 <h2 id="sos-modal-title">Contactos SOS 🚨</h2>
                 <button className="sos-close-btn" type="button" aria-label="Cerrar contactos SOS" onClick={() => setShowContactModal(false)}>
                  <FaTimes />
                </button>
              </div>

              {loadingContacts ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</p>
              ) : isAddingContact ? (
                
                <form className="sos-modal-form" onSubmit={handleAddContact}>
                  <p>Agrega a un familiar, amigo o especialista. (Ej. +505 8888 8888)</p>
                  <input 
                     type="text" placeholder="Nombre (ej. Mamá)" maxLength={100}
                    value={newName} onChange={(e) => setNewName(e.target.value)} required 
                  />
                  <input 
                     type="tel" placeholder="Número con código de país" maxLength={40}
                    value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required 
                  />
                  <div className="sos-modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setIsAddingContact(false)}>Cancelar</button>
                    <button type="submit" className="btn-save">Guardar</button>
                  </div>
                </form>

              ) : (

                <div>
                  {contacts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '20px 0' }}>No tienes contactos registrados.</p>
                  ) : (
                    <div className="sos-contact-list">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="sos-contact-item">
                          <div className="sos-contact-header">
                            <strong>{contact.nombre}</strong>
                             <button className="sos-delete-btn" type="button" aria-label={`Eliminar a ${contact.nombre || "este contacto"}`} onClick={() => handleDeleteContact(contact.id)}><FaTrash /></button>
                          </div>
                          <div className="sos-contact-buttons">
                            <button className="sos-call-btn" onClick={() => handleNormalCall(contact.telefono)}>
                              <FaPhoneAlt /> Llamar
                            </button>
                            <button className="sos-wa-btn" onClick={() => handleWhatsAppCall(contact.telefono)}>
                              <FaWhatsapp /> WhatsApp
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                   <button className="sos-add-btn" type="button" onClick={() => setIsAddingContact(true)}>
                     <FaPlus /> Añadir nuevo contacto
                   </button>
                 </div>
               )}
             </div>
           </div>
         )}

        {showBreathing && (
          <BreathingModal
            uid={user?.uid}
            close={() => setShowBreathing(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default SOS;
