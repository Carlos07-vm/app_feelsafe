import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ProtectedRoute() {
  const { user, loading } = useApp();

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
        Cargando FeelSafe...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.correoVerificado && !user.emailVerified) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }

  // Si la cuenta autenticada es de un especialista, redirigir a su panel profesional
  if (user.tipoCuenta === "especialista" || user.rol === "especialista") {
    return <Navigate to="/specialist/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
