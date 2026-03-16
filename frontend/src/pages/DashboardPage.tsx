import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("recordarme");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Bienvenido</h1>

        <p className="dashboard-user">
          Usuario: <strong>{usuario?.usuario || "Sin usuario"}</strong>
        </p>

        <p className="dashboard-message">Página en construcción XD.</p>

        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default DashboardPage;