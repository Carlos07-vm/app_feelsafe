import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { logout } from "../services/authService";

/**
 * SpecialistProtectedRoute
 * Protege todas las rutas del especialista.
 * Requisitos para acceder:
 *   1. El usuario debe estar autenticado (user !== null)
 *   2. Su tipoCuenta debe ser "especialista"
 *
 * Si no está autenticado → redirige a /login
 * Si está autenticado pero no es especialista → redirige a /dashboard
 */
function SpecialistProtectedRoute() {
  const { user, loading } = useApp();

  // Mientras se verifica la sesión, no redirigir prematuramente
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "Inter, sans-serif",
          color: "#6D4C8F",
          fontSize: "1rem",
          gap: "12px",
        }}
      >
        <span
          style={{
            width: "20px",
            height: "20px",
            border: "3px solid #D9C3F2",
            borderTop: "3px solid #6D4C8F",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.8s linear infinite",
          }}
        />
        Verificando acceso...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No autenticado → al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.correoVerificado && !user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        replace
        state={{ email: user.email, accountType: "especialista" }}
      />
    );
  }

  // Autenticado pero no es especialista → al dashboard de usuario
  if (user.tipoCuenta !== "especialista") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.estado !== "Activo") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <h1>Solicitud en revisión</h1>
          <p>
            Tu correo ya está verificado. Un administrador debe aprobar tu perfil profesional antes de habilitar el acceso.
          </p>
          <button type="button" onClick={() => logout()}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // Especialista verificado → mostrar la ruta protegida
  return <Outlet />;
}

export default SpecialistProtectedRoute;
