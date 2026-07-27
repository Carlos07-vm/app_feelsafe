import "../styles/Auth.css";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { reload } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";
function VerifyEmail() {
    const navigate = useNavigate();
   const location = useLocation();
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   const email = location.state?.email || "";

   const handleCheckVerification = async () => {
    setLoading(true)
    setMessage("");

    try{
        const user = auth.currentUser;

         if (!user) {
             setMessage("No hay ninguna sesión activa.");
             return;
    }


   await reload(user);

    const refreshedUser = auth.currentUser;

if (refreshedUser?.emailVerified) {
    await updateDoc(doc(db, "users", refreshedUser.uid), {
        emailVerificado: true,
        estado: "Activo",
    });

    navigate("/login");
    } else {
    setMessage("Todavía no has verificado tu correo.");
    }

     } catch (error) {

    setMessage(
      "Ocurrió un error al comprobar la verificación."
    );

    } finally {

    setLoading(false);

  }
};


   return(

    <div className="auth-container">
        <div className="auth-card">

         <h1>📧 Verifica tu correo</h1>

         <p> Hemos enviado un enlace de verificación a:   </p>

         <h3>{email || "No se pudo obtener el correo electrónico."}</h3>

         <p> Revisa tu bandeja de entrada y también la carpeta de spam.</p>

    <button 
        onClick={handleCheckVerification}
        disabled={loading}>
         {loading
    ? "Comprobando..."
    : "Ya verifiqué mi correo"}

    </button>

    {message && (
  <p className="auth-info">
    {message}
  </p>
)}

        </div>
    </div>
   );
}
export default VerifyEmail;



       