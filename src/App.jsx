import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// ================= Páginas públicas =================
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/verifyEmail";

import SpecialistRegister from "./pages/SpecialistRegister";
import SpecialistMessages from "./pages/SpecialistMessages";
import SpecialistProfile from "./pages/SpecialistProfile";
import SpecialistUsers from "./pages/SpecialistUsers";
import SpecialistSettings from "./pages/SpecialistSettings";

// ================= Dashboard =================
import Dashboard from "./pages/Dashboard";
import SpecialistDashboard from "./pages/SpecialistDashboard";

// ================= Bienestar =================
// CORRECCIÓN 1: Importamos correctamente Emotions
import Emotions from "./pages/Emotions"; 
import Analysis from "./pages/Analysis";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";

// ================= Chat =================
import Chatbot from "./pages/Chatbot";
import Specialists from "./pages/Specialists";
import ChatRoom from "./pages/ChatRoom";
import UserConversations from "./pages/UserConversations";
import RoomChat from "./pages/RoomChat";
import SpecialistConversations from "./pages/SpecialistConversations";
import SpecialistChat from "./pages/SpecialistChat";
import SpecialistRooms from "./pages/SpecialistRooms";

// ================= Recursos =================
import Resources from "./pages/Resources";
import CalendarPage from "./pages/Calendar";
import Alerts from "./pages/Alerts";
import SOS from "./pages/Sos";

// ================= Perfil =================
import Profile from "./pages/Profile";
import SpecialistAgenda from "./pages/SpecialistAgenda";
// ================= Componentes =================
import ProtectedRoute from "./components/ProtectedRoute";
import SpecialistProtectedRoute from "./components/SpecialistProtectedRoute";
import NativeBackButtonHandler from "./components/NativeBackButtonHandler";


function App() {
  return (
    <BrowserRouter>
      <NativeBackButtonHandler />
      <AppProvider>
        <Routes>

          {/* =================================================
              RUTAS PÚBLICAS
          ================================================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* =================================================
              RUTAS DEL ESPECIALISTA — Registro es público
          ================================================= */}
          <Route path="/specialist/register" element={<SpecialistRegister />} />

          {/* =================================================
              RUTAS DEL ESPECIALISTA — Requieren autenticación
              como especialista (SpecialistProtectedRoute)
          ================================================= */}
          <Route element={<SpecialistProtectedRoute />}>
            <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
            <Route path="/specialist/messages" element={<SpecialistMessages />} />
            <Route path="/specialist/profile" element={<SpecialistProfile />} />
            <Route path="/specialist/users" element={<SpecialistUsers />} />
            <Route path="/specialist-conversations" element={<SpecialistConversations />} />
            <Route path="/specialist/rooms" element={<SpecialistRooms />} />
            <Route path="/specialist/agenda" element={<SpecialistAgenda />} />
            <Route path="/specialist/settings" element={<SpecialistSettings />} />
            <Route path="/specialist-chat/:conversationId" element={<SpecialistChat />} />
            <Route path="/specialist-room/:roomId" element={<RoomChat />} />
          </Route>

          {/* =================================================
              RUTAS PROTEGIDAS DEL USUARIO
          ================================================= */}
          <Route element={<ProtectedRoute />}>

            {/* ================= Dashboard ================= */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ================= Bienestar ================= */}
            {/* CORRECCIÓN 2: Mantenemos el path "/mood" para no romper los botones del Dashboard */}
            <Route path="/mood" element={<Emotions />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/goals" element={<Goals />} />

            {/* ================= Chat ================= */}
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/conversations" element={<UserConversations />} />
            <Route path="/chat-room" element={<ChatRoom />} />
            <Route path="/chat-room/:conversationId" element={<ChatRoom />} />
            <Route path="/room/:roomId" element={<RoomChat />} />

            {/* ================= Recursos ================= */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/sos" element={<SOS />} />

            {/* ================= Perfil ================= */}
            <Route path="/profile" element={<Profile />} />

          </Route>

          {/* =================================================
              RUTA NO ENCONTRADA
          ================================================= */}
          <Route path="*" element={<Landing />} />

        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
