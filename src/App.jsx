import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MoodTracker from "./pages/MoodTracker";
import Chatbot from "./pages/Chatbot";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CalendarPage from "./pages/Calendar";
import Analysis from "./pages/Analysis";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Goals from "./pages/Goals";
import SOS from "./pages/Sos";
import VerifyCode from "./pages/VerifyCode";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/home" element={<Home />} />
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

        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;