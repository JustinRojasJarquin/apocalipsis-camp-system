import { useState, useEffect } from "react";
import type { Exploracion, ExploracionEstado } from "../types";
import { listarExploraciones, actualizarEstado } from "../exploraciones.api";
import ExploracionForm from "../components/ExploracionForm";
import AsignarPersonas from "../components/AsignarPersonas";
import RecursosMision from "../components/RecursosMision";

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
  const [vistaDetalle, setVistaDetalle] = useState<
    "personas" | "recursos" | null
  >(null);

  const cargarExploraciones = async () => {
    try {
      setCargando(true);
      setError("");
      const datos = await listarExploraciones(ID_CAMPAMENTO_MOCK);
      setExploraciones(datos);
    } catch (e: any) {
      setError(e.message || "Error al cargar exploraciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarExploraciones();
  }, []);

  const handleCambiarEstado = async (
    exp: Exploracion,
    nuevoEstado: ExploracionEstado
  ) => {
    try {
      await actualizarEstado(exp.id_exploracion, nuevoEstado);
      await cargarExploraciones();
    } catch (e: any) {
      alert(e.message);
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
    <div className="exploraciones-page">
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
                  <span className="texto-cerrado">Exploración finalizada</span>
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
    </div>
  );
}

export default ExploracionesPage;
