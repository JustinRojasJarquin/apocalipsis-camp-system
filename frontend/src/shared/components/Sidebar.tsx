import { Link, useLocation } from "react-router-dom";

function TopNav() {
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Inicio" },
    { to: "/campamentos", label: "Campamentos" },
    { to: "/exploraciones", label: "Exploraciones" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(2, 6, 23, 0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ minWidth: "220px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.1,
            }}
          >
            Apocalipsis Camp
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Sistema de administración
          </p>
        </div>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            flex: 1,
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
                    ? "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(59,130,246,0.10))"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.28)"
                    : "1px solid transparent",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.25s ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ minWidth: "180px", display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(220, 38, 38, 0.25)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;