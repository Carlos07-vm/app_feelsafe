import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ProtectedRoute() {
  const { user, loading } = useApp();

  if (loading) {
    return <p className="loading-screen">Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;