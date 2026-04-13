import { useState, useEffect } from "react";
import type { Exploracion, ExploracionEstado } from "../types";
import { listarExploraciones, actualizarEstado, eliminarExploracion } from "../exploraciones.api";
import ExploracionForm from "../components/ExploracionForm";
import AsignarPersonas from "../components/AsignarPersonas";
import RecursosMision from "../components/RecursosMision";
import Navbar from "../../../shared/components/Navbar";
import Sidebar from "../../../shared/components/Sidebar";

const ESTADO_ETIQUETA: Record<ExploracionEstado, string> = {
  PLANIFICADA: "Planificada",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  FALLIDA: "Fallida",
};

const ESTADO_COLOR: Record<ExploracionEstado, string> = {
  PLANIFICADA: "#f0a500",
  EN_PROGRESO: "#2a9d8f",
  COMPLETADA: "#4caf50",
  CANCELADA: "#9e9e9e",
  FALLIDA: "#e63946",
};

// TODO: Obtener el campamento activo del contexto de sesión cuando esté implementado
const ID_CAMPAMENTO_MOCK = 1;

function ExploracionesPage() {
  const [exploraciones, setExploraciones] = useState<Exploracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Exploracion | null>(null);
  const [vistaDetalle, setVistaDetalle] = useState<"personas" | "recursos" | null>(null);
  const [exploracionAEliminar, setExploracionAEliminar] = useState<Exploracion | null>(null);

  const cargarExploraciones = async () => {
    try {
      setCargando(true);
      setError("");
      const datos = await listarExploraciones(ID_CAMPAMENTO_MOCK);
      setExploraciones(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar exploraciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarExploraciones();
  }, []);

  const handleEliminar = (exp: Exploracion) => {
    setExploracionAEliminar(exp);
  };

  const confirmarEliminar = async () => {
    if (!exploracionAEliminar) return;
    try {
      await eliminarExploracion(exploracionAEliminar.id_exploracion);
      setExploracionAEliminar(null);
      await cargarExploraciones();
    } catch (e) {
      setExploracionAEliminar(null);
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const handleCambiarEstado = async (
    exp: Exploracion,
    nuevoEstado: ExploracionEstado
  ) => {
    try {
      await actualizarEstado(exp.id_exploracion, nuevoEstado);
      await cargarExploraciones();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cambiar estado");
    }
  };

  const handleCreada = () => {
    setMostrarFormulario(false);
    cargarExploraciones();
  };

  const abrirDetalle = (exp: Exploracion, vista: "personas" | "recursos") => {
    setSeleccionada(exp);
    setVistaDetalle(vista);
  };

  const cerrarDetalle = () => {
    setSeleccionada(null);
    setVistaDetalle(null);
    cargarExploraciones();
  };

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main className="exploraciones-page">
      <div className="exploraciones-header">
        <h1>Exploraciones</h1>
        <button
          className="btn-primario"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nueva exploración
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {cargando ? (
        <p className="cargando-texto">Cargando exploraciones...</p>
      ) : exploraciones.length === 0 ? (
        <div className="sin-datos">
          <p>No hay exploraciones registradas para este campamento.</p>
        </div>
      ) : (
        <div className="exploraciones-lista">
          {exploraciones.map((exp) => (
            <div key={exp.id_exploracion} className="exploracion-card">
              <div className="card-encabezado">
                <div>
                  <h2>{exp.nombre}</h2>
                  {exp.descripcion && (
                    <p className="card-descripcion">{exp.descripcion}</p>
                  )}
                </div>
                <span
                  className="estado-badge"
                  style={{ backgroundColor: ESTADO_COLOR[exp.estado] }}
                >
                  {ESTADO_ETIQUETA[exp.estado]}
                </span>
              </div>

              <div className="card-datos">
                <span>
                  Inicio planeado:{" "}
                  {new Date(exp.fecha_inicio_plan).toLocaleDateString("es-CR")}
                </span>
                <span>Días estimados: {exp.dias_estimados}</span>
                <span>Días extra: {exp.dias_extra}</span>
                <span>
                  Exploradores: {exp.exploracion_persona.length}
                </span>
              </div>

              <div className="card-acciones">
                {exp.estado === "PLANIFICADA" && (
                  <>
                    <button
                      className="btn-secundario"
                      onClick={() => abrirDetalle(exp, "personas")}
                    >
                      Asignar personas
                    </button>
                    <button
                      className="btn-secundario"
                      onClick={() => abrirDetalle(exp, "recursos")}
                    >
                      Recursos a llevar
                    </button>
                    <button
                      className="btn-accion iniciar"
                      onClick={() =>
                        handleCambiarEstado(exp, "EN_PROGRESO")
                      }
                    >
                      Iniciar
                    </button>
                    <button
                      className="btn-accion cancelar"
                      onClick={() =>
                        handleCambiarEstado(exp, "CANCELADA")
                      }
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {exp.estado === "EN_PROGRESO" && (
                  <>
                    <button
                      className="btn-secundario"
                      onClick={() => abrirDetalle(exp, "recursos")}
                    >
                      Registrar encontrados
                    </button>
                    <button
                      className="btn-accion completar"
                      onClick={() =>
                        handleCambiarEstado(exp, "COMPLETADA")
                      }
                    >
                      Completar
                    </button>
                    <button
                      className="btn-accion cancelar"
                      onClick={() => handleCambiarEstado(exp, "FALLIDA")}
                    >
                      Marcar fallida
                    </button>
                  </>
                )}

                {(exp.estado === "COMPLETADA" ||
                  exp.estado === "CANCELADA" ||
                  exp.estado === "FALLIDA") && (
                  <>
                    <span className="texto-cerrado">Exploración finalizada</span>
                    <button
                      className="btn-accion cancelar"
                      onClick={() => handleEliminar(exp)}
                    >
                      Eliminar
                    </button>
                  </>
                )}

                {exp.estado === "PLANIFICADA" && (
                  <button
                    className="btn-accion cancelar"
                    onClick={() => handleEliminar(exp)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <ExploracionForm
              idCampamento={ID_CAMPAMENTO_MOCK}
              onCreada={handleCreada}
              onCancelar={() => setMostrarFormulario(false)}
            />
          </div>
        </div>
      )}

      {seleccionada && vistaDetalle === "personas" && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <AsignarPersonas
              exploracion={seleccionada}
              onCerrar={cerrarDetalle}
            />
          </div>
        </div>
      )}

      {seleccionada && vistaDetalle === "recursos" && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <RecursosMision
              exploracion={seleccionada}
              onCerrar={cerrarDetalle}
            />
          </div>
        </div>
      )}

      {exploracionAEliminar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="form-container">
              <h2>Eliminar exploración</h2>
              <p>¿Estás segura de que deseas eliminar <strong>{exploracionAEliminar.nombre}</strong>? Esta acción no se puede deshacer.</p>
              <div className="form-acciones">
                <button className="btn-secundario" onClick={() => setExploracionAEliminar(null)}>
                  Cancelar
                </button>
                <button className="btn-accion cancelar" onClick={confirmarEliminar}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}

export default ExploracionesPage;
