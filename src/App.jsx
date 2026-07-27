import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= Páginas públicas =================
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/verifyEmail";
// ================= Páginas protegidas =================
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Chatbot from "./pages/Chatbot";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import CalendarPage from "./pages/Calendar";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Goals from "./pages/Goals";
import SOS from "./pages/Sos";

// ================= Componentes =================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= Rutas públicas ================= */}

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
       <Route path="/verify-email" element={<VerifyEmail />} />
        {/* ================= Rutas protegidas ================= */}

        <Route element={<ProtectedRoute />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/sos" element={<SOS />} />

        </Route>

        {/* ================= Ruta por defecto ================= */}

        <Route path="*" element={<Landing />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;