import "../styles/Calendar.css";
import MainLayout from "../layouts/MainLayout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CalendarPage() {
  return (
    <MainLayout>

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

      </MainLayout>
  );
}

export default CalendarPage;