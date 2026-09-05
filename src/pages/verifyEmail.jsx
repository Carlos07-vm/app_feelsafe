// =========================================================
// IMPORTACIONES
// =========================================================
import "../styles/Auth.css"; // Estilos de autenticación
import "../styles/MeditationModal.css"; 
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext"; // Contexto global (idioma y tema)

// --- FIREBASE ---
import { auth, db } from "../services/firebase";
import { reload, sendEmailVerification } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

// --- ICONOS ---
import { FaEnvelope, FaCheckCircle, FaRedo, FaExclamationCircle } from "react-icons/fa";

// =========================================================
// DICCIONARIO LOCAL DE TRADUCCIONES
// =========================================================
const pageTranslations = {
  es: {
    title: "Verifica tu correo",
    sentTo: "Hemos enviado un enlace de verificación a:",
    noEmail: "No se pudo obtener el correo electrónico.",
    checkSpam: "Revisa tu bandeja de entrada y también la carpeta de spam.",
    btnCheck: "Ya verifiqué mi correo",
    btnChecking: "Comprobando...",
    btnResend: "Reenviar correo",
    btnResending: "Enviando...",
    btnWait: "Reenviar en",
    errNoSession: "No hay ninguna sesión activa.",
    errNotVerified: "Todavía no has verificado tu correo.",
    errCheckFailed: "Ocurrió un error al comprobar la verificación.",
    errLoginResend: "Inicia sesión nuevamente para reenviar el correo.",
    msgResendSuccess: "Se envió un nuevo correo de verificación.",
    errResendFailed: "No fue posible reenviar el correo."
  },
  en: {
    title: "Verify your email",
    sentTo: "We sent a verification link to:",
    noEmail: "Could not retrieve email address.",
    checkSpam: "Check your inbox and also your spam folder.",
    btnCheck: "I have verified my email",
    btnChecking: "Checking...",
    btnResend: "Resend email",
    btnResending: "Sending...",
    btnWait: "Resend in",
    errNoSession: "No active session found.",
    errNotVerified: "You haven't verified your email yet.",
    errCheckFailed: "An error occurred while checking verification.",
    errLoginResend: "Log in again to resend the email.",
    msgResendSuccess: "A new verification email was sent.",
    errResendFailed: "Could not resend the email."
  }
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp(); // Extraemos el idioma actual del contexto
  const t = pageTranslations[language] || pageTranslations.es;

  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'error' o 'success' para colorear el mensaje
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Obtenemos el correo desde la navegación previa
  const email = location.state?.email || "";

  // ==================== FUNCIONES ====================

  /**
   * Comprueba en Firebase si el usuario ya hizo clic en el enlace de su correo.
   */
  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessageType("error");
        setMessage(t.errNoSession);
        return;
      }

      // Recarga los datos del usuario directamente desde los servidores de Firebase
      await reload(auth.currentUser);
      const refreshedUser = auth.currentUser;

      if (refreshedUser?.emailVerified) {
        // Si ya está verificado, actualiza Firestore y redirige
        await updateDoc(doc(db, "usuarios", refreshedUser.uid), {
          emailVerificado: true,
          estado: "Activo",
        });
        navigate("/dashboard");
      } else {
        setMessageType("error");
        setMessage(t.errNotVerified);
      }
    } catch (error) {
      setMessageType("error");
      setMessage(t.errCheckFailed);
    } finally {
      setLoading(false);
    }
  };

  // Temporizador con limpieza automática
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // =========================================================
  // FUNCIÓN 2: REENVIAR CORREO DE VERIFICACIÓN
  // =========================================================

  const handleResendEmail = async () => {
    if (countdown > 0 || resending) return;

    const user = auth.currentUser;

    if (!user) {
      setMessageType("error");
      setMessage(t.errLoginResend);
      return;
    }

    try {
      setResending(true);
      
      // Envía el correo mediante Firebase Auth
      await sendEmailVerification(user);

      setMessageType("success");
      setMessage(t.msgResendSuccess);
      setCountdown(60); // Inicia el bloqueo de 60 segundos
    } catch (error) {
      setMessageType("error");
      setMessage(t.errResendFailed);
    } finally {
      setResending(false);
    }
  };

  // =========================================================
  // INTERFAZ DE USUARIO (RENDER)
  // =========================================================

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center", padding: "40px 30px" }}>
        
        {/* Icono animado y Título */}
        <div style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: "15px" }}>
          <FaEnvelope />
        </div>
        <h2 style={{ marginBottom: "20px", color: "var(--text)" }}>{t.title}</h2>

        {/* Información del correo */}
        <p style={{ color: "var(--text-muted)", marginBottom: "5px" }}>
          {t.sentTo}
        </p>
        <h3 style={{ color: "var(--text)", marginBottom: "20px", wordBreak: "break-all" }}>
          {email || t.noEmail}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "30px" }}>
          {t.checkSpam}
        </p>

        {/* Mensajes de Error / Éxito */}
        {message && (
          <div 
            style={{ 
              backgroundColor: messageType === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", 
              color: messageType === "error" ? "#ef4444" : "#10b981",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: "600"
            }}
          >
            {messageType === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            {message}
          </div>
        )}

        {/* Botón Principal: Comprobar Verificación */}
        <button 
          className="auth-btn"
          onClick={handleCheckVerification}
          disabled={loading}
          style={{ width: "100%", marginBottom: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
        >
          {loading ? (
            t.btnChecking
          ) : (
            <>
              <FaCheckCircle /> {t.btnCheck}
            </>
          )}
        </button>

        {/* Botón Secundario: Reenviar Correo */}
        <button
          className="auth-btn-secondary"
          onClick={handleResendEmail}
          disabled={resending || countdown > 0}
          style={{ 
            width: "100%", 
            background: "transparent", 
            border: "2px solid var(--border)", 
            color: "var(--text)",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "600",
            cursor: (resending || countdown > 0) ? "not-allowed" : "pointer",
            opacity: (resending || countdown > 0) ? 0.6 : 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s"
          }}
        >
          <FaRedo />
          {countdown > 0
            ? `${t.btnWait} ${countdown}s`
            : resending
            ? t.btnResending
            : t.btnResend
          }
        </button>

      </div>
    </div>
  );
}

export default VerifyEmail;
