import { Link, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";

const ROLES = {
  ADMIN: ["ADMIN", "ADMINISTRADOR"],
  GESTOR_RECURSOS: ["GESTOR_RECURSOS", "GESTION_RECURSOS"],
  VIAJES: ["VIAJES", "ENCARGADO_VIAJES"],
  TRABAJADOR: ["TRABAJADOR"],
};

function Navbar() {
  const location = useLocation();
  const usuario = storage.getUsuario();

  const rolCodigo = usuario?.rol?.codigo;
  const cargoNombre = usuario?.persona?.cargo?.nombre;
  const campamentoNombre = usuario?.persona?.campamento?.nombre;

  const handleLogout = () => {
    storage.clearAuth();
    window.location.href = "/";
  };

  const menuItems = [
    {
      to: "/dashboard",
      label: "Inicio",
      roles: [
        ...ROLES.ADMIN,
        ...ROLES.GESTOR_RECURSOS,
        ...ROLES.VIAJES,
        ...ROLES.TRABAJADOR,
      ],
    },
    {
      to: "/campamentos",
      label: "Campamentos",
      roles: [...ROLES.ADMIN],
    },
    {
      to: "/personas",
      label: "Personas",
      roles: [...ROLES.ADMIN],
    },
    {
      to: "/inventario",
      label: "Inventario",
      roles: [...ROLES.ADMIN, ...ROLES.GESTOR_RECURSOS, ...ROLES.TRABAJADOR],
    },
    {
      to: "/exploraciones",
      label: "Exploraciones",
      roles: [...ROLES.ADMIN, ...ROLES.VIAJES],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (!rolCodigo) return false;
    return item.roles.includes(rolCodigo);
  });

  return (
    <header
      style={{
        height: "84px",
        background: "rgba(2, 6, 23, 0.92)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          display: "grid",
          gridTemplateColumns: "260px 1fr 260px",
          alignItems: "center",
          gap: "20px",
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
            {rolCodigo ? `Rol: ${rolCodigo}` : "Sistema de administración"}
          </p>

          {cargoNombre && (
            <p
              style={{
                margin: "2px 0 0 0",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Cargo: {cargoNombre}
              {campamentoNombre ? ` · ${campamentoNombre}` : ""}
            </p>
          )}
        </div>

        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {visibleMenuItems.map((item) => {
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

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              border: "none",
              padding: "12px 18px",
              borderRadius: "14px",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 8px 18px rgba(185, 28, 28, 0.25)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;