import { Link } from "react-router-dom";
import {
  FaHome,
  FaSmile,
  FaRobot,
  FaChartBar,
  FaBook,
  FaCalendarAlt,
  FaBrain,
  FaUserCircle,
  FaBell,
  FaBullseye,
  FaLifeRing
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
       <img src="/src/assets/logo.jpeg" alt="" />
      </div>

      <nav className="sidebar-menu">

        <Link to="/">
          <FaHome />
          <span>Inicio</span>
        </Link>

        <Link to="/mood">
          <FaSmile />
          <span>Emociones</span>
        </Link>

        <Link to="/chat">
          <FaRobot />
          <span>Chat IA</span>
        </Link>

        <Link to="/reports">
          <FaChartBar />
          <span>Reportes</span>
        </Link>

        <Link to="/resources">
          <FaBook />
          <span>Recursos</span>
        </Link>

         <Link to="/calendar">
        <FaCalendarAlt />
        <span>Calendario</span>
        </Link>

        <Link to="/analysis">
        <FaBrain />
        <span>Análisis IA</span>
        </Link>

        <Link to="/profile">
        <FaUserCircle />
        <span>Perfil</span>
        </Link>

        <Link to="/alerts">
        <FaBell />
        <span>Alertas</span>
        </Link>

        <Link to="/goals">
        <FaBullseye />
        <span>Objetivos</span>
         </Link>

         <Link to="/sos">
        <FaLifeRing />
        <span>Centro SOS</span>
         </Link>
            


      </nav>

    </aside>
  );
}

export default Sidebar;