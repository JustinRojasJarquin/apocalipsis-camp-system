interface CardProps {
  title: string;
  value: string | number;
}

const cardColors: Record<string, string> = {
  Campamentos: "#3b82f6",
  Personas: "#22c55e",
  Inventario: "#f59e0b",
  Exploraciones: "#ef4444",
};

function Card({ title, value }: CardProps) {
  const accent = cardColors[title] || "#3b82f6";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #111827 0%, #0f172a 100%)",
        padding: "22px",
        borderRadius: "18px",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        borderLeft: `4px solid ${accent}`,
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 30px rgba(0, 0, 0, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.25)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-18px",
          right: "-18px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: `${accent}22`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            color: "#94a3b8",
            margin: 0,
            marginBottom: "10px",
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
          }}
        >
          {value}
        </h2>
      </div>
    </div>
  );
}

export default Card;