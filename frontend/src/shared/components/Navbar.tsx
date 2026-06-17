import { Link, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import { useInactivityTimer } from "../hooks/useInactivityTimer";

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

  const { secondsLeft } = useInactivityTimer();

  const handleLogout = () => {
    storage.clearAuth();
    window.location.href = "/";
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
      roles: [...ROLES.ADMIN, ...ROLES.VIAJES],
    },
    {
      to: "/evaluaciones",
      label: "Evaluaciones",
      roles: [...ROLES.ADMIN, ...ROLES.VIAJES],
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      roles: [...ROLES.ADMIN],
    },
    {
      to: "/inventario",
      label: "Inventario",
      roles: [
        ...ROLES.ADMIN,
        ...ROLES.GESTOR_RECURSOS,
        ...ROLES.TRABAJADOR,
      ],
    },
    {
      to: "/recursos",
      label: "Catalogo de recursos",
      roles: [
        ...ROLES.ADMIN,
        ...ROLES.GESTOR_RECURSOS,
        ...ROLES.TRABAJADOR,
      ],
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
    <header className="admin-navbar">
      <div className="admin-navbar__inner">
        <div className="admin-navbar__brand">
          <span className="admin-navbar__mark">AC</span>

          <div>
            <h1>Apocalipsis Camp</h1>
            <p>{rolCodigo ? `Rol: ${rolCodigo}` : "Sistema de administracion"}</p>
            {cargoNombre && (
              <small>
                Cargo: {cargoNombre}
                {campamentoNombre ? ` / ${campamentoNombre}` : ""}
              </small>
            )}
          </div>
        </div>

        <nav className="admin-navbar__links">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive
                    ? "admin-navbar__link is-active"
                    : "admin-navbar__link"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-navbar__actions">
          <div className="inactivity-timer" title="Tiempo restante de sesion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className={`inactivity-timer__value${secondsLeft <= 60 ? " is-warning" : ""}`}>
              {formatTime(secondsLeft)}
            </span>
          </div>
          <button
            className="admin-navbar__logout"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;