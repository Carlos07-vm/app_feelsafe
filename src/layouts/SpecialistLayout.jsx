import SpecialistSidebar from "../components/SpecialistSidebar";
import "../styles/SpecialistDashboard.css";

function SpecialistLayout({ children }) {
  return (
    <div className="specialist-dashboard">

      <SpecialistSidebar />

      <main className="specialist-main">
        {children}
      </main>

    </div>
  );
}

export default SpecialistLayout;