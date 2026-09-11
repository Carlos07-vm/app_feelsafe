import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FaHome,
  FaSmile,
  FaRobot,
  FaLifeRing,
  FaUserCircle,
} from 'react-icons/fa';
import '../styles/BottomNav.css';

function BottomNav() {
  const { language } = useApp();
  const location = useLocation();

  const hideOnRoutes = ['/', '/login', '/register', '/verify-email', '/specialist/register'];
  if (hideOnRoutes.includes(location.pathname) || location.pathname.startsWith('/specialist')) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Navegación inferior principal">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => "bottom-nav-item " + (isActive ? "active" : "")}
      >
        <FaHome className="bottom-nav-icon" />
        <span>{language === 'es' ? 'Inicio' : 'Home'}</span>
      </NavLink>

      <NavLink
        to="/mood"
        className={({ isActive }) => "bottom-nav-item " + (isActive ? "active" : "")}
      >
        <FaSmile className="bottom-nav-icon" />
        <span>{language === 'es' ? 'Emoción' : 'Mood'}</span>
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) => "bottom-nav-item " + (isActive ? "active" : "")}
      >
        <FaRobot className="bottom-nav-icon" />
        <span>{language === 'es' ? 'IA Chat' : 'AI Chat'}</span>
      </NavLink>

      <NavLink
        to="/sos"
        className={({ isActive }) => "bottom-nav-item item-sos " + (isActive ? "active" : "")}
      >
        <FaLifeRing className="bottom-nav-icon" />
        <span>SOS</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => "bottom-nav-item " + (isActive ? "active" : "")}
      >
        <FaUserCircle className="bottom-nav-icon" />
        <span>{language === 'es' ? 'Perfil' : 'Profile'}</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
