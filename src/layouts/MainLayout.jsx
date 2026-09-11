import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

        <main className="main-content" id="main-content">
        <header className="topbar">
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={sidebarOpen}
            aria-controls="primary-navigation"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </header>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

export default MainLayout;
