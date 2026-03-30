import { useEffect, useState } from "react";
import Navbar from "../shared/components/Navbar";
import Sidebar from "../shared/components/Sidebar";
import { useAuth } from "../shared/hooks/useAuth";
import Card from "../shared/components/Card";
import { getCampamentos } from "../features/campamentos/campamentos.api";

function DashboardPage() {
  const { usuario } = useAuth();
  const [campamentosCount, setCampamentosCount] = useState(0);

  useEffect(() => {
    const loadCampamentos = async () => {
      try {
        const campamentos = await getCampamentos();
        const campamentosActivos = campamentos.filter(
          (campamento) => campamento.activo !== false,
        );
        setCampamentosCount(campamentosActivos.length);
      } catch {
        setCampamentosCount(0);
      }
    };

    void loadCampamentos();
  }, []);

  //actualizado
  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />

        <main style={{ padding: "20px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ color: "white", fontSize: "24px" }}>
              Bienvenido, {usuario?.usuario}
            </h1>
            <p style={{ color: "#94a3b8" }}>Panel de control del sistema</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <Card title="Campamentos" value={campamentosCount} />
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
