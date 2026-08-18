import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= Páginas públicas =================
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/verifyEmail";

// ================= Dashboard =================
import Dashboard from "./pages/Dashboard";

// ================= Bienestar =================
import MoodTracker from "./pages/MoodTracker";
import Analysis from "./pages/Analysis";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";

// ================= Chat =================
import Chatbot from "./pages/Chatbot";
import Specialists from "./pages/Specialists";
import ChatRoom from "./pages/ChatRoom";

// ================= Recursos =================
import Resources from "./pages/Resources";
import CalendarPage from "./pages/Calendar";
import Alerts from "./pages/Alerts";
import SOS from "./pages/Sos";

// ================= Perfil =================
import Profile from "./pages/Profile";

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

          {/* ================= Dashboard ================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ================= Bienestar emocional ================= */}

          <Route
            path="/mood"
            element={<MoodTracker />}
          />

          <Route
            path="/analysis"
            element={<Analysis />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/goals"
            element={<Goals />}
          />

          {/* ================= Chat ================= */}

          <Route
            path="/chat"
            element={<Chatbot />}
          />

          <Route
            path="/specialists"
            element={<Specialists />}
          />

          <Route
            path="/chat-room"
            element={<ChatRoom />}
          />

          {/* ================= Recursos ================= */}

          <Route
            path="/resources"
            element={<Resources />}
          />

          <Route
            path="/calendar"
            element={<CalendarPage />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          <Route
            path="/sos"
            element={<SOS />}
          />

          {/* ================= Perfil ================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        {/* ================= Ruta por defecto ================= */}

        <Route
          path="*"
          element={<Landing />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;