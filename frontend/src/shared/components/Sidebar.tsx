import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "20px",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Menú</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/campamentos">Campamentos</Link>
        <Link to="/personas">Personas</Link>
        <Link to="/inventario">Inventario</Link>
        <Link to="/exploraciones">Exploraciones</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;