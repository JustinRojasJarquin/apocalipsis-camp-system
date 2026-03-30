import Navbar from "../shared/components/Navbar";
import Sidebar from "../shared/components/Sidebar";
import { useAuth } from "../shared/hooks/useAuth";
import Card from "../shared/components/Card"

//Para que tengan una base con que partir con los modulos campamentos, personas, exploraciones e invetarios 
function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div style={{ display: "flex", background: "#0f172a" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div style={{ flex: 1 }}>
        <Navbar />

        <main style={{ padding: "20px" }}>
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ color: "white", fontSize: "24px" }}>
              Bienvenido, {usuario?.usuario}
            </h1>
            <p style={{ color: "#94a3b8" }}>
              Panel de control del sistema
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <Card title="Campamentos" value="0" />
            <Card title="Personas" value="0" />
            <Card title="Inventario" value="0" />
            <Card title="Exploraciones" value="0" />
          </div>

        </main>
      </div>
    </div>
  );
}

export default DashboardPage;