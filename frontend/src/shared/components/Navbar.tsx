import { storage } from "../utils/storage";

function Navbar() {
  const handleLogout = () => {
    storage.clearAuth();
    window.location.href = "/";
  };

  return (
    <header
      style={{
        height: "60px",
        background: "#020617",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid #1f2937",
      }}
    >
      <span>Dashboard</span>

      <button
        onClick={handleLogout}
        style={{
          background: "#dc2626",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </header>
  );
}

export default Navbar;