import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/campamentos", label: "Campamentos" },
    { to: "/personas", label: "Personas" },
    { to: "/inventario", label: "Inventario" },
    { to: "/exploraciones", label: "Exploraciones" },
  ];

  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "white",
        padding: "24px 18px",
        borderRight: "1px solid rgba(148, 163, 184, 0.12)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: "30px",
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          Sistema
        </h2>
        <p
          style={{
            margin: "6px 0 0 0",
            fontSize: "13px",
            color: "#94a3b8",
          }}
        >
          Panel administrativo
        </p>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: "none",
                color: isActive ? "#f8fafc" : "#cbd5e1",
                background: isActive
                  ? "linear-gradient(90deg, rgba(59,130,246,0.20), rgba(59,130,246,0.05))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(59,130,246,0.22)"
                  : "1px solid transparent",
                padding: "14px 16px",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.25s ease",
                display: "block",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(148, 163, 184, 0.08)";
                  e.currentTarget.style.color = "#f8fafc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;