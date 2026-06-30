import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <img src="/src/assets/logo.jpeg" alt="" />
      </div>

      <div className="nav-links">
        <Link to="/">Inicio</Link>
        <Link to="/mood">Emociones</Link>
        <Link to="/chat">IA</Link>
        <Link to="/reports">Reportes</Link>
        <Link to="/resources">Recursos</Link>
      </div>

    </nav>
  );
}

export default Navbar;