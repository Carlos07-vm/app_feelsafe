import "../styles/Auth.css";
import "../styles/MeditationModal.css";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { 
    reload,
     sendEmailVerification,
 } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";

function VerifyEmail() {
    const navigate = useNavigate();
   const location = useLocation();
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);


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


   await reload(auth.currentUser);

    const refreshedUser = auth.currentUser;

if (refreshedUser?.emailVerified) {
    await updateDoc(doc(db, "usuarios", refreshedUser.uid), {
        emailVerificado: true,
        estado: "Activo",
    });

    navigate("/dashboard");
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

const handleResendEmail = async () => {

  const user = auth.currentUser;

  if (!user) {
    setMessage(
      "Inicia sesión nuevamente para reenviar el correo."
    );
    return;
  }

  try {

    setResending(true);

    await sendEmailVerification(user);

    setMessage(
      "Se envió un nuevo correo de verificación."
    );

    setCountdown(60);

    const timer = setInterval(() => {

      setCountdown((prev) => {

        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;

      });

    }, 1000);

  } catch (error) {

    setMessage(
      "No fue posible reenviar el correo."
    );

  } finally {

    setResending(false);

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

    
    <button
    onClick={handleResendEmail}
    disabled={resending || countdown > 0}
        >

        {
        countdown > 0
        ? `Reenviar en ${countdown}s`
        : resending
        ? "Enviando..."
        : "Reenviar correo"
        }

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



       