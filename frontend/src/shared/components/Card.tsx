import { Link } from "react-router-dom";

interface CardProps {
  title: string;
  value: string | number;
  to?: string;
  description?: string;
  icon?: string;
}

const cardColors: Record<string, string> = {
  Campamentos: "#3b82f6",
  Personas: "#22c55e",
  Inventario: "#f59e0b",
  Exploraciones: "#ef4444",
};

function Card({ title, value, to, description, icon }: CardProps) {
  const accent = cardColors[title] || "#3b82f6";

  const content = (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #111827 0%, #0f172a 100%)",
        padding: "24px",
        borderRadius: "22px",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        borderLeft: `5px solid ${accent}`,
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: to ? "pointer" : "default",
        minHeight: "180px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 16px 30px rgba(0, 0, 0, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.25)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-18px",
          right: "-18px",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: `${accent}22`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {icon ? (
          <div
            style={{
              fontSize: "30px",
              marginBottom: "14px",
            }}
          >
            {icon}
          </div>
        ) : null}

        <p
          style={{
            color: "#94a3b8",
            margin: 0,
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </p>

        <h2
          style={{
            color: "#f8fafc",
            fontSize: "34px",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.1,
            marginBottom: "10px",
          }}
        >
          {value}
        </h2>

        {description ? (
          <p
            style={{
              color: "#94a3b8",
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default Card;