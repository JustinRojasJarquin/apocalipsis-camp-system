import { storage } from "../utils/storage";

function Navbar() {
  const handleLogout = () => {
    storage.clearAuth();
    window.location.href = "/";
  };

  return (
    <header
      style={{
        height: "76px",
        background: "rgba(2, 6, 23, 0.88)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 28px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          Apocalipsis Camp
        </h1>
        <p
          style={{
            margin: "4px 0 0 0",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Sistema de administración
        </p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "linear-gradient(135deg, #dc2626, #b91c1c)",
          border: "none",
          padding: "10px 16px",
          borderRadius: "10px",
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 8px 18px rgba(185, 28, 28, 0.25)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 12px 22px rgba(185, 28, 28, 0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 8px 18px rgba(185, 28, 28, 0.25)";
        }}
      >
        Cerrar sesión
      </button>
    </header>
  );
}

export default Navbar;