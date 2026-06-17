import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  Play,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import type { Exploracion, ExploracionEstado } from "../types";
import {
  listarExploraciones,
  actualizarEstado,
  eliminarExploracion,
} from "../exploraciones.api";
import ExploracionForm from "../components/ExploracionForm";
import AsignarPersonas from "../components/AsignarPersonas";
import RecursosMision from "../components/RecursosMision";
import { PageModal } from "../../../shared/components/PageModal";
import Navbar from "../../../shared/components/Navbar";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import { storage } from "../../../shared/utils/storage";

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

function ExploracionesPage() {
  const [exploraciones, setExploraciones] = useState<Exploracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Exploracion | null>(null);
  const [vistaDetalle, setVistaDetalle] = useState<"personas" | "recursos" | null>(null);
  const [exploracionAEliminar, setExploracionAEliminar] = useState<Exploracion | null>(null);
  const [filters, setFilters] = useState({
    buscar: "",
    estado: "" as ExploracionEstado | "",
  });

  const debouncedBuscar = useDebouncedValue(filters.buscar);

  const exploracionesFiltradas = useMemo(() => {
    const buscar = debouncedBuscar.trim().toLowerCase();

    return exploraciones.filter((exp) => {
      const descripcion = exp.descripcion?.toLowerCase() ?? "";
      return (
        (!buscar ||
          exp.nombre.toLowerCase().includes(buscar) ||
          descripcion.includes(buscar)) &&
        (!filters.estado || exp.estado === filters.estado)
      );
    });
  }, [exploraciones, debouncedBuscar, filters.estado]);

  const idCampamento = storage.getUsuario()?.persona?.campamento?.id_campamento ?? 0;

  const cargarExploraciones = async () => {
    try {
      setCargando(true);
      setError("");
      const datos = await listarExploraciones(idCampamento);
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
    <div style={{ display: "flex", background: "#09110f", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Gestión operativa</span>
              <h1>Exploraciones</h1>
              <p className="page-description">
                Administra misiones, asignación de personas, recursos y
                seguimiento de estados dentro del campamento.
              </p>
            </div>

            <div className="page-header-actions">
              <div className="campamentos-stat">
                <span className="stat-label">Total</span>
                <strong className="stat-value">{exploraciones.length}</strong>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => setMostrarFormulario(true)}
              >
                + Nueva exploración
              </button>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-filter-card">
            <div className="campamentos-filter-row">
              <label className="filter-field">
                <span>Buscar</span>
                <input
                  value={filters.buscar}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      buscar: event.target.value,
                    }))
                  }
                  placeholder="Nombre o descripción"
                />
              </label>

              <label className="filter-field">
                <span>Estado</span>
                <select
                  value={filters.estado}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      estado: event.target.value as ExploracionEstado | "",
                    }))
                  }
                >
                  <option value="">Todos</option>
                  {(Object.keys(ESTADO_ETIQUETA) as ExploracionEstado[]).map(
                    (estado) => (
                      <option key={estado} value={estado}>
                        {ESTADO_ETIQUETA[estado]}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </section>

          {cargando ? (
            <div className="empty-state">
              <p>Cargando exploraciones...</p>
            </div>
          ) : exploracionesFiltradas.length === 0 ? (
            <div className="empty-state">
              <h3>
                {exploraciones.length === 0
                  ? "No hay exploraciones registradas"
                  : "No hay exploraciones que coincidan con los filtros"}
              </h3>
              <p>
                {exploraciones.length === 0
                  ? "Crea una nueva exploración para comenzar a organizar las misiones."
                  : "Prueba ajustando los filtros de búsqueda o estado."}
              </p>
            </div>
          ) : (
            <section className="campamentos-list">
              <div className="filter-results-meta">
                <span>
                  Mostrando <strong>{exploracionesFiltradas.length}</strong> de{" "}
                  <strong>{exploraciones.length}</strong> exploraciones
                </span>
              </div>

              {exploracionesFiltradas.map((exp) => (
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
                    <div className="campamento-summary-item">
                      <span>Inicio planeado</span>
                      <strong>
                        {new Date(exp.fecha_inicio_plan).toLocaleDateString("es-CR")}
                      </strong>
                    </div>

                    <div className="campamento-summary-item">
                      <span>Días estimados</span>
                      <strong>{exp.dias_estimados}</strong>
                    </div>

                    <div className="campamento-summary-item">
                      <span>Días extra</span>
                      <strong>{exp.dias_extra}</strong>
                    </div>

                    <div className="campamento-summary-item">
                      <span>Exploradores</span>
                      <strong>{exp.exploracion_persona.length}</strong>
                    </div>
                  </div>

                  <CrudActions layout="card">
                    {exp.estado === "PLANIFICADA" && (
                      <>
                        <CrudActionGroup>
                          <CrudAction
                            label="Asignar personas"
                            icon={Users}
                            onClick={() => abrirDetalle(exp, "personas")}
                          />
                          <CrudAction
                            label="Recursos a llevar"
                            icon={Package}
                            onClick={() => abrirDetalle(exp, "recursos")}
                          />
                        </CrudActionGroup>

                        <CrudActionGroup>
                          <CrudAction
                            label="Iniciar"
                            icon={Play}
                            variant="success"
                            onClick={() => handleCambiarEstado(exp, "EN_PROGRESO")}
                          />
                        </CrudActionGroup>

                        <CrudActionGroup>
                          <CrudAction
                            label="Cancelar"
                            icon={XCircle}
                            variant="danger-soft"
                            onClick={() => handleCambiarEstado(exp, "CANCELADA")}
                          />
                          <CrudAction
                            label="Eliminar"
                            icon={Trash2}
                            variant="danger"
                            onClick={() => handleEliminar(exp)}
                          />
                        </CrudActionGroup>
                      </>
                    )}

                    {exp.estado === "EN_PROGRESO" && (
                      <>
                        <CrudActionGroup>
                          <CrudAction
                            label="Registrar encontrados"
                            icon={Package}
                            onClick={() => abrirDetalle(exp, "recursos")}
                          />
                        </CrudActionGroup>

                        <CrudActionGroup>
                          <CrudAction
                            label="Completar"
                            icon={CheckCircle}
                            variant="success"
                            onClick={() => handleCambiarEstado(exp, "COMPLETADA")}
                          />
                          <CrudAction
                            label="Marcar fallida"
                            icon={AlertTriangle}
                            variant="warning"
                            onClick={() => handleCambiarEstado(exp, "FALLIDA")}
                          />
                        </CrudActionGroup>
                      </>
                    )}

                    {(exp.estado === "COMPLETADA" ||
                      exp.estado === "CANCELADA" ||
                      exp.estado === "FALLIDA") && (
                      <>
                        <span className="texto-cerrado">Exploración finalizada</span>

                        <CrudActionGroup>
                          <CrudAction
                            label="Eliminar"
                            icon={Trash2}
                            variant="danger"
                            onClick={() => handleEliminar(exp)}
                          />
                        </CrudActionGroup>
                      </>
                    )}
                  </CrudActions>
                </article>
              ))}
            </section>
          )}

          {mostrarFormulario && (
            <PageModal
              title="Nueva exploración"
              onClose={() => setMostrarFormulario(false)}
              size="lg"
            >
              <ExploracionForm
                idCampamento={idCampamento}
                onCreada={handleCreada}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </PageModal>
          )}

          {seleccionada && vistaDetalle === "personas" && (
            <PageModal onClose={cerrarDetalle} size="lg">
              <AsignarPersonas exploracion={seleccionada} onCerrar={cerrarDetalle} />
            </PageModal>
          )}

          {seleccionada && vistaDetalle === "recursos" && (
            <PageModal onClose={cerrarDetalle} size="lg">
              <RecursosMision exploracion={seleccionada} onCerrar={cerrarDetalle} />
            </PageModal>
          )}

          {exploracionAEliminar && (
            <PageModal
              title="Eliminar exploración"
              onClose={() => setExploracionAEliminar(null)}
              size="sm"
            >
                  <p className="section-description">
                    ¿Estás segura de que deseas eliminar{" "}
                    <strong>{exploracionAEliminar.nombre}</strong>? Esta acción no se
                    puede deshacer.
                  </p>

                  <CrudActions layout="inline">
                    <CrudActionGroup>
                      <CrudAction
                        label="Cancelar"
                        variant="default"
                        onClick={() => setExploracionAEliminar(null)}
                      />
                    </CrudActionGroup>
                    <CrudActionGroup>
                      <CrudAction
                        label="Eliminar"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => void confirmarEliminar()}
                      />
                    </CrudActionGroup>
                  </CrudActions>
            </PageModal>
          )}
        </main>
      </div>
    </div>
  );
}

export default ExploracionesPage;