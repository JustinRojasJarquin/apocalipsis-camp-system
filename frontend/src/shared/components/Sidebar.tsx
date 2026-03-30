import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "20px",
        borderRight: "1px solid #1f2937",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>
        Sistema
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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