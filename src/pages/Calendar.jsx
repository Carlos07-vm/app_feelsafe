import Sidebar from "../components/Sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CalendarPage() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <h1 className="page-title">
          📅 Calendario Emocional
        </h1>

        <div className="calendar-card">

          <Calendar />

        </div>

        <div className="legend">

          <div>
            🟢 Feliz
          </div>

          <div>
            🟡 Neutral
          </div>

          <div>
            🟠 Ansioso
          </div>

          <div>
            🔴 Triste
          </div>

        </div>

      </main>

    </div>
  );
}

export default CalendarPage;