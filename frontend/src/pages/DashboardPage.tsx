import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { getCampamentos } from "../features/campamentos/campamentos.api";
import { getPersonas } from "../features/personas/personas.api";
import { getResources } from "../features/inventario/inventario.api";
import { listarExploraciones } from "../features/exploraciones/exploraciones.api";
import { storage } from "../shared/utils/storage";

import campamentosIcon from "../assets/campamentos.png";
import personasIcon from "../assets/personas.png";
import inventarioIcon from "../assets/inventario.png";
import exploracionesIcon from "../assets/exploraciones.png";

import "../styles/theme.css";

type DashboardStats = {
  campamentos: number;
  personas: number;
  inventario: number;
  exploraciones: number;
};

type ModuleItem = {
  title: string;
  value?: number;
  countLabel?: string;
  to: string;
  icon: string;
  accent: string;
  description: string;
  status: string;
};

type ModuleItemWithRoles = ModuleItem & {
  roles: string[];
};

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(239,68,68,0.10), transparent 22%), linear-gradient(135deg, #020617 0%, #0f172a 42%, #111827 100%)",
    padding: "40px 24px 56px",
  },
  shell: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  hero: {
    position: "relative" as const,
    overflow: "hidden",
    marginBottom: "32px",
    padding: "36px",
    borderRadius: "32px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.98) 55%, rgba(37,99,235,0.18) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 24px 48px rgba(0,0,0,0.30)",
  },
  heroGlowOne: {
    position: "absolute" as const,
    top: "-80px",
    right: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.16)",
    filter: "blur(12px)",
  },
  heroGlowTwo: {
    position: "absolute" as const,
    bottom: "-70px",
    left: "-50px",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "rgba(34,197,94,0.10)",
    filter: "blur(10px)",
  },
  heroTopBar: {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "22px",
    flexWrap: "wrap" as const,
  },
  heroContent: {
    position: "relative" as const,
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.7fr 1fr",
    gap: "24px",
    alignItems: "stretch",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    gap: "18px",
  },
  heroHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(59,130,246,0.22)",
    color: "#93c5fd",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  },
  logoutButton: {
    border: "1px solid rgba(248,113,113,0.30)",
    background: "rgba(127,29,29,0.20)",
    color: "#fecaca",
    padding: "10px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  heroTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "46px",
    lineHeight: 1.02,
    fontWeight: 900,
  },
  heroText: {
    margin: 0,
    maxWidth: "720px",
    color: "#cbd5e1",
    fontSize: "16px",
    lineHeight: 1.8,
  },
  heroRight: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  miniStat: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(148,163,184,0.12)",
    backdropFilter: "blur(6px)",
  },
  miniStatLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  miniStatValue: {
    color: "#f8fafc",
    fontSize: "28px",
    fontWeight: 900,
    lineHeight: 1.1,
  },
  miniStatText: {
    marginTop: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "20px",
    flexWrap: "wrap" as const,
  },
  sectionTag: {
    margin: 0,
    marginBottom: "6px",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  },
  sectionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 800,
  },
  sectionSubtitle: {
    margin: "8px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "22px",
  },
  link: {
    textDecoration: "none",
  },
};

function DashboardPage() {
  const { usuario } = useAuth();

  const rolCodigo = usuario?.rol?.codigo ?? "";
  const cargoNombre = usuario?.persona?.cargo?.nombre;
  const campamentoNombre = usuario?.persona?.campamento?.nombre;
  const nombrePersona = usuario?.persona?.nombre;

  const [stats, setStats] = useState<DashboardStats>({
    campamentos: 0,
    personas: 0,
    inventario: 0,
    exploraciones: 0,
  });

  const handleLogout = () => {
    storage.clearAuth();
    window.location.href = "/";
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      const idCampamento =
        usuario?.persona?.campamento?.id_campamento ??
        Number(localStorage.getItem("campamento_id"));

      const [
        campamentosResult,
        personasResult,
        inventarioResult,
        exploracionesResult,
      ] = await Promise.allSettled([
        getCampamentos(),
        getPersonas(),
        idCampamento ? getResources(idCampamento) : Promise.resolve([]),
        idCampamento ? listarExploraciones(idCampamento) : Promise.resolve([]),
      ]);

      const campamentos =
        campamentosResult.status === "fulfilled"
          ? campamentosResult.value
          : [];

      const personas =
        personasResult.status === "fulfilled" ? personasResult.value : [];

      const inventario =
        inventarioResult.status === "fulfilled"
          ? inventarioResult.value
          : [];

      const exploraciones =
        exploracionesResult.status === "fulfilled"
          ? exploracionesResult.value
          : [];

      const campamentosActivos = campamentos.filter(
        (campamento: { activo?: boolean }) => campamento.activo !== false,
      );

      setStats({
        campamentos: campamentosActivos.length,
        personas: personas.length,
        inventario: inventario.length,
        exploraciones: exploraciones.length,
      });
    };

    void loadDashboardData();
  }, [usuario]);

  const heroMessage = useMemo(() => {
    if (rolCodigo === "ADMIN" || rolCodigo === "ADMINISTRADOR") {
      return "Panel administrativo general. Puedes gestionar campamentos, personas, recursos y operaciones del sistema.";
    }

    if (rolCodigo === "GESTOR_RECURSOS" || rolCodigo === "GESTION_RECURSOS") {
      return "Panel de gestión de recursos. Puedes revisar inventario, alertas y movimientos del campamento.";
    }

    if (rolCodigo === "VIAJES" || rolCodigo === "ENCARGADO_VIAJES") {
      return "Panel de viajes y exploraciones. Puedes gestionar exploraciones, traslados y seguimiento operativo.";
    }

    return `Panel del trabajador. Cargo: ${cargoNombre ?? "Sin cargo"}${
      campamentoNombre ? ` · Campamento: ${campamentoNombre}` : ""
    }.`;
  }, [rolCodigo, cargoNombre, campamentoNombre]);

  const modules: ModuleItem[] = useMemo(() => {
    const allModules: ModuleItemWithRoles[] = [
      {
        title: "Campamentos",
        value: stats.campamentos,
        countLabel: "Registros",
        to: "/campamentos",
        icon: campamentosIcon,
        accent: "#3b82f6",
        description:
          "Administra campamentos, estado operativo y configuración general.",
        status: "Disponible",
        roles: ["ADMIN", "ADMINISTRADOR"],
      },
      {
        title: "Personas",
        value: stats.personas,
        countLabel: "Registros",
        to: "/personas",
        icon: personasIcon,
        accent: "#22c55e",
        description:
          "Gestiona expedientes, cargos y personal registrado en el sistema.",
        status: "Disponible",
        roles: ["ADMIN", "ADMINISTRADOR"],
      },
      {
        title: "Inventario",
        value: stats.inventario,
        countLabel: "Registros",
        to: "/inventario",
        icon: inventarioIcon,
        accent: "#f59e0b",
        description:
          "Administra recursos, existencias y movimientos del inventario.",
        status: "Disponible",
        roles: [
          "ADMIN",
          "ADMINISTRADOR",
          "GESTOR_RECURSOS",
          "GESTION_RECURSOS",
          "TRABAJADOR",
        ],
      },
      {
        title: "Exploraciones",
        value: stats.exploraciones,
        countLabel: "Registros",
        to: "/exploraciones",
        icon: exploracionesIcon,
        accent: "#ef4444",
        description:
          "Gestiona exploraciones, seguimiento operativo y resultados.",
        status: "Disponible",
        roles: ["ADMIN", "ADMINISTRADOR", "VIAJES", "ENCARGADO_VIAJES"],
      },
    ];

    if (!rolCodigo) {
      return allModules;
    }

    return allModules.filter((module) => module.roles.includes(rolCodigo));
  }, [stats, rolCodigo]);

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroGlowOne} />
          <div style={styles.heroGlowTwo} />

          <div style={styles.heroTopBar}>
            <span style={styles.heroTag}>Centro de control</span>

            <button type="button" style={styles.logoutButton} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>

          <div style={styles.heroContent}>
            <div style={styles.heroLeft}>
              <div>
                <div style={styles.heroHeader}>
                  <span style={styles.heroTag}>
                    {rolCodigo ? `Rol: ${rolCodigo}` : "Panel principal"}
                  </span>
                </div>

                <h1 style={styles.heroTitle}>
                  Hola, {nombrePersona ?? usuario?.usuario ?? "usuario"}
                </h1>

                <p style={styles.heroText}>{heroMessage}</p>
              </div>
            </div>

            <div style={styles.heroRight}>
              <div style={styles.miniStat}>
                <span style={styles.miniStatLabel}>Campamentos</span>
                <div style={styles.miniStatValue}>{stats.campamentos}</div>
                <div style={styles.miniStatText}>Activos en el sistema</div>
              </div>

              <div style={styles.miniStat}>
                <span style={styles.miniStatLabel}>Personas</span>
                <div style={styles.miniStatValue}>{stats.personas}</div>
                <div style={styles.miniStatText}>Registros disponibles</div>
              </div>

              <div style={styles.miniStat}>
                <span style={styles.miniStatLabel}>Inventario</span>
                <div style={styles.miniStatValue}>{stats.inventario}</div>
                <div style={styles.miniStatText}>Recursos registrados</div>
              </div>

              <div style={styles.miniStat}>
                <span style={styles.miniStatLabel}>Exploraciones</span>
                <div style={styles.miniStatValue}>{stats.exploraciones}</div>
                <div style={styles.miniStatText}>Exploraciones registradas</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionTag}>Navegación principal</p>
              <h2 style={styles.sectionTitle}>Módulos disponibles</h2>
              <p style={styles.sectionSubtitle}>
                Los módulos visibles dependen del rol asignado a tu usuario.
              </p>
            </div>
          </div>

          <div style={styles.grid}>
            {modules.map((module) => (
              <Link key={module.title} to={module.to} style={styles.link}>
                <ModuleCard module={module} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ModuleCard({ module }: { module: ModuleItem }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "250px",
        padding: "26px",
        borderRadius: "28px",
        background:
          "linear-gradient(165deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.98) 60%, rgba(30,41,59,0.95) 100%)",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        boxShadow: "0 14px 30px rgba(0, 0, 0, 0.28)",
        transition:
          "transform 0.28s ease, box-shadow 0.28s ease, border 0.28s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-36px",
          right: "-36px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: `${module.accent}20`,
          filter: "blur(4px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${module.accent}20`,
              border: `1px solid ${module.accent}30`,
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

          <span
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 800,
              background: "rgba(34,197,94,0.12)",
              color: "#86efac",
              border: "1px solid rgba(34,197,94,0.22)",
            }}
          >
            {module.status}
          </span>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <h3
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#f8fafc",
              fontSize: "26px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {module.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "14px",
              lineHeight: 1.65,
            }}
          >
            {module.description}
          </p>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: "4px",
              padding: "12px 14px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(148,163,184,0.10)",
            }}
          >
            <span
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {module.countLabel ?? "Registros"}
            </span>

            <span
              style={{
                color: "#f8fafc",
                fontSize: "28px",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {module.value ?? 0}
            </span>
          </div>

          <div
            style={{
              color: module.accent,
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            Entrar →
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;