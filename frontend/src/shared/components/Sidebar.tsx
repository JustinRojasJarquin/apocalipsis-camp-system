import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Inicio" },
    { to: "/campamentos", label: "Campamentos" },
    { to: "/exploraciones", label: "Exploraciones" },
  ];

  return (
    <aside
      style={{
        width: "270px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "white",
        padding: "24px 18px",
        borderRight: "1px solid rgba(148, 163, 184, 0.12)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            marginBottom: "28px",
            padding: "18px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(15,23,42,0.45))",
            border: "1px solid rgba(59, 130, 246, 0.18)",
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
            Apocalipsis Camp
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

        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              color: "#64748b",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 10px 10px",
            }}
          >
            Principal
          </p>

          <nav
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
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
                      ? "linear-gradient(90deg, rgba(59,130,246,0.22), rgba(59,130,246,0.06))"
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
                      e.currentTarget.style.background =
                        "rgba(148, 163, 184, 0.08)";
                      e.currentTarget.style.color = "#f8fafc";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#cbd5e1";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(148, 163, 184, 0.10)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#e2e8f0",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Acceso rápido
        </p>
        <p
          style={{
            margin: "6px 0 0 0",
            color: "#94a3b8",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Usa las tarjetas del panel principal para entrar a cada módulo.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
