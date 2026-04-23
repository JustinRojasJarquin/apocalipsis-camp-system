import { useEffect, useState } from "react";
import type { Exploracion, ExploracionEstado } from "../types";
import {
  listarExploraciones,
  actualizarEstado,
  eliminarExploracion,
} from "../exploraciones.api";
import ExploracionForm from "../components/ExploracionForm";
import AsignarPersonas from "../components/AsignarPersonas";
import RecursosMision from "../components/RecursosMision";
import Navbar from "../../../shared/components/Navbar";
import "../../../styles/theme.css";

const ESTADO_ETIQUETA: Record<ExploracionEstado, string> = {
  PLANIFICADA: "Planificada",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  FALLIDA: "Fallida",
};

const ESTADO_CLASE: Record<ExploracionEstado, string> = {
  PLANIFICADA: "badge-planificada",
  EN_PROGRESO: "badge-progreso",
  COMPLETADA: "badge-completada",
  CANCELADA: "badge-cancelada",
  FALLIDA: "badge-fallida",
};


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
    void cargarExploraciones();
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
    nuevoEstado: ExploracionEstado,
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
    void cargarExploraciones();
  };

  const abrirDetalle = (exp: Exploracion, vista: "personas" | "recursos") => {
    setSeleccionada(exp);
    setVistaDetalle(vista);
  };

  const cerrarDetalle = () => {
    setSeleccionada(null);
    setVistaDetalle(null);
    void cargarExploraciones();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>

      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="exploraciones-page">
          <section className="exploraciones-hero">
            <div className="exploraciones-hero__content">
              <p className="exploraciones-hero__eyebrow">Gestión operativa</p>
              <h1 className="exploraciones-hero__title">Exploraciones</h1>
              <p className="exploraciones-hero__subtitle">
                Administra misiones, asignación de personas, recursos y seguimiento
                de estados dentro del campamento.
              </p>
            </div>

            <button
              className="btn-primario"
              onClick={() => setMostrarFormulario(true)}
            >
              + Nueva exploración
            </button>
          </section>

          {error && <p className="error-text">{error}</p>}

          {cargando ? (
            <div className="exploraciones-empty">
              <p className="cargando-texto">Cargando exploraciones...</p>
            </div>
          ) : exploraciones.length === 0 ? (
            <div className="exploraciones-empty">
              <h3>No hay exploraciones registradas</h3>
              <p>Crea una nueva exploración para comenzar a organizar las misiones.</p>
            </div>
          ) : (
            <section className="exploraciones-lista">
              {exploraciones.map((exp) => (
                <article key={exp.id_exploracion} className="exploracion-card">
                  <div className="exploracion-card__top">
                    <div className="exploracion-card__title-block">
                      <h2>{exp.nombre}</h2>
                      {exp.descripcion && (
                        <p className="card-descripcion">{exp.descripcion}</p>
                      )}
                    </div>

                    <span className={`estado-badge ${ESTADO_CLASE[exp.estado]}`}>
                      {ESTADO_ETIQUETA[exp.estado]}
                    </span>
                  </div>

                  <div className="exploracion-stats">
                    <div className="stat-item">
                      <span className="stat-label">Inicio planeado</span>
                      <strong>
                        {new Date(exp.fecha_inicio_plan).toLocaleDateString("es-CR")}
                      </strong>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Días estimados</span>
                      <strong>{exp.dias_estimados}</strong>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Días extra</span>
                      <strong>{exp.dias_extra}</strong>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Exploradores</span>
                      <strong>{exp.exploracion_persona.length}</strong>
                    </div>
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
                          className="btn-accion btn-success"
                          onClick={() => handleCambiarEstado(exp, "EN_PROGRESO")}
                        >
                          Iniciar
                        </button>

                        <button
                          className="btn-accion btn-danger-soft"
                          onClick={() => handleCambiarEstado(exp, "CANCELADA")}
                        >
                          Cancelar
                        </button>

                        <button
                          className="btn-accion btn-danger"
                          onClick={() => handleEliminar(exp)}
                        >
                          Eliminar
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
                          className="btn-accion btn-success"
                          onClick={() => handleCambiarEstado(exp, "COMPLETADA")}
                        >
                          Completar
                        </button>

                        <button
                          className="btn-accion btn-warning"
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
                          className="btn-accion btn-danger"
                          onClick={() => handleEliminar(exp)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </section>
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
                <AsignarPersonas exploracion={seleccionada} onCerrar={cerrarDetalle} />
              </div>
            </div>
          )}

          {seleccionada && vistaDetalle === "recursos" && (
            <div className="modal-overlay">
              <div className="modal-contenido">
                <RecursosMision exploracion={seleccionada} onCerrar={cerrarDetalle} />
              </div>
            </div>
          )}

          {exploracionAEliminar && (
            <div className="modal-overlay">
              <div className="modal-contenido">
                <div className="form-container">
                  <h2>Eliminar exploración</h2>
                  <p>
                    ¿Estás segura de que deseas eliminar{" "}
                    <strong>{exploracionAEliminar.nombre}</strong>? Esta acción no se
                    puede deshacer.
                  </p>

                  <div className="form-acciones">
                    <button
                      className="btn-secundario"
                      onClick={() => setExploracionAEliminar(null)}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn-accion btn-danger"
                      onClick={confirmarEliminar}
                    >
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