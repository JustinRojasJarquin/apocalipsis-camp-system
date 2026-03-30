import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("recordarme");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-overline">Panel de Control</p>
            <h1>Bienvenido</h1>
            <p className="dashboard-message">
              Accede al módulo de campamentos y administra tu información desde
              aquí.
            </p>
          </div>
        </header>

        <div className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="panel-header">
              <h2>Campamentos</h2>
              <p>Visualiza y administra todos los campamentos disponibles.</p>
            </div>
            <button
              className="button button-primary dashboard-action-button"
              onClick={() => navigate("/campamentos")}
            >
              Ir a campamentos
            </button>
          </article>

          <article className="dashboard-panel dashboard-panel-secondary">
            <div className="panel-header">
              <h2>Cuenta</h2>
              <p>Cierra sesión de forma segura cuando termines.</p>
            </div>
            <button
              className="button button-secondary dashboard-action-button"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
