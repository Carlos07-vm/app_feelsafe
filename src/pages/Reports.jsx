import Sidebar from "../components/Sidebar";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Lun", mood: 80 },
  { day: "Mar", mood: 75 },
  { day: "Mié", mood: 90 },
  { day: "Jue", mood: 60 },
  { day: "Vie", mood: 85 },
  { day: "Sáb", mood: 95 },
  { day: "Dom", mood: 88 },
];

function Reports() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <h1 className="page-title">
          📊 Reportes Emocionales
        </h1>

        <div className="report-cards">

          <div className="report-card">
            <h3>Bienestar General</h3>
            <h2>85%</h2>
          </div>

          <div className="report-card">
            <h3>Estado Actual</h3>
            <h2>😊 Feliz</h2>
          </div>

          <div className="report-card success">
            <h3>Semáforo</h3>
            <h2>🟢 Estable</h2>
          </div>

        </div>

        <div className="chart-card">

          <h2>Evolución Semanal</h2>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="mood"
                stroke="#7B61FF"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

      </main>
    </div>
  );
}

export default Reports;