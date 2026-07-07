import "../styles/StatCard.css";

function StatCard({ title, value, icon }) {
  return (
    <article className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <p className="stat-title">
          {title}
        </p>

        <h3 className="stat-value">
          {value}
        </h3>

      </div>

    </article>
  );
}

export default StatCard;