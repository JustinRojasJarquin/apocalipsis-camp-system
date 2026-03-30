interface CardProps {
  title: string;
  value: string | number;
}

function Card({ title, value }: CardProps) {
  return (
    <div
      style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #1f2937",
      }}
    >
      <p style={{ color: "#94a3b8", marginBottom: "8px" }}>
        {title}
      </p>

      <h2 style={{ color: "white", fontSize: "24px" }}>
        {value}
      </h2>
    </div>
  );
}

export default Card;