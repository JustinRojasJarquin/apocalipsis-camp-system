import { useEffect, useState } from "react";
import Navbar from "../shared/components/Navbar";
import Sidebar from "../shared/components/Sidebar";
import { useAuth } from "../shared/hooks/useAuth";
import Card from "../shared/components/Card";
import { getCampamentos } from "../features/campamentos/campamentos.api";
import { getPersonas } from "../features/personas/personas.api";

function DashboardPage() {
  const { usuario } = useAuth();
  const [campamentosCount, setCampamentosCount] = useState(0);
  const [personasCount, setPersonasCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campamentos, personas] = await Promise.all([
          getCampamentos(),
          getPersonas(),
        ]);

        const campamentosActivos = campamentos.filter(
          (campamento) => campamento.activo !== false,
        );

        setCampamentosCount(campamentosActivos.length);
        setPersonasCount(personas.length);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setCampamentosCount(0);
        setPersonasCount(0);
      }
    };

    void loadData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e293b 100%)",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            padding: "32px",
          }}
        >
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(15,23,42,0.95) 100%)",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: "24px",
              padding: "32px",
              marginBottom: "30px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              style={{
                color: "#60a5fa",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Panel principal
            </p>

            <h1
              style={{
                color: "#f8fafc",
                fontSize: "32px",
                fontWeight: 700,
                margin: 0,
                marginBottom: "10px",
              }}
            >
              Bienvenido, {usuario?.usuario}
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: "16px",
                margin: 0,
                maxWidth: "700px",
                lineHeight: 1.6,
              }}
            >
              Desde aquí puedes visualizar rápidamente el estado general del
              sistema y acceder a los módulos principales del proyecto.
            </p>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2
              style={{
                color: "#f1f5f9",
                fontSize: "20px",
                marginBottom: "18px",
              }}
            >
              Resumen general
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <Card title="Campamentos" value={campamentosCount} />
              <Card title="Personas" value={personasCount} />
              <Card title="Inventario" value="0" />
              <Card title="Exploraciones" value="0" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;