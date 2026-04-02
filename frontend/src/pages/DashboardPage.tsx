import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../shared/components/Navbar";
import { useAuth } from "../shared/hooks/useAuth";
import { getCampamentos } from "../features/campamentos/campamentos.api";
import { getPersonas } from "../features/personas/personas.api";

import campamentosIcon from "../assets/campamentos.png";
import personasIcon from "../assets/personas.png";
import inventarioIcon from "../assets/inventario.png";
import exploracionesIcon from "../assets/exploraciones.png";

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

  const modules = [
    {
      title: "Campamentos",
      value: campamentosCount,
      to: "/campamentos",
      icon: campamentosIcon,
      accent: "#3b82f6",
      description: "Administra los campamentos registrados en el sistema.",
    },
    {
      title: "Personas",
      value: personasCount,
      to: "/personas",
      icon: personasIcon,
      accent: "#22c55e",
      description: "Gestiona la información de las personas registradas.",
    },
    {
      title: "Inventario",
      value: 0,
      to: "/inventario",
      icon: inventarioIcon,
      accent: "#f59e0b",
      description: "Controla recursos, existencias y movimientos.",
    },
    {
      title: "Exploraciones",
      value: 0,
      to: "/exploraciones",
      icon: exploracionesIcon,
      accent: "#ef4444",
      description: "Revisa y administra las exploraciones del sistema.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 25%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e293b 100%)",
      }}
    >
      <Navbar />

      <main
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "36px 28px 48px",
        }}
      >
        <section
          style={{
            marginBottom: "32px",
            padding: "32px",
            borderRadius: "28px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(15,23,42,0.96) 100%)",
            border: "1px solid rgba(148,163,184,0.14)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: "10px",
              color: "#60a5fa",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Menú principal 
          </p>

          <h1
            style={{
              margin: 0,
              marginBottom: "10px",
              color: "#f8fafc",
              fontSize: "36px",
              fontWeight: 800,
            }}
          >
            Bienvenido, {usuario?.usuario} 
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              color: "#cbd5e1",
              fontSize: "16px",
              lineHeight: 1.7,
            }}
          >
            Selecciona uno de los módulos para ingresar directamente a su
            gestión.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              color: "#f8fafc",
              fontSize: "22px",
              marginBottom: "18px",
            }}
          >
            Módulos del sistema
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {modules.map((module) => (
              <Link
                key={module.title}
                to={module.to}
                style={{
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: "220px",
                    padding: "26px",
                    borderRadius: "26px",
                    background:
                      "linear-gradient(160deg, rgba(17,24,39,0.96) 0%, rgba(15,23,42,0.98) 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.12)",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.26)",
                    transition: "transform 0.28s ease, box-shadow 0.28s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-8px) scale(1.015)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 36px rgba(0, 0, 0, 0.34)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 28px rgba(0, 0, 0, 0.26)";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-30px",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: `${module.accent}22`,
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "6px",
                      background: module.accent,
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        width: "62px",
                        height: "62px",
                        borderRadius: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "18px",
                        background: `${module.accent}22`,
                        border: `1px solid ${module.accent}33`,
                        padding: "12px",
                      }}
                    >
                      <img
                        src={module.icon}
                        alt={module.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        marginBottom: "8px",
                        color: "#f8fafc",
                        fontSize: "24px",
                        fontWeight: 700,
                      }}
                    >
                      {module.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        marginBottom: "20px",
                        color: "#94a3b8",
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {module.description}
                    </p>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(148,163,184,0.10)",
                      }}
                    >
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        Registros
                      </span>
                      <span
                        style={{
                          color: "#f8fafc",
                          fontSize: "22px",
                          fontWeight: 800,
                        }}
                      >
                        {module.value}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;