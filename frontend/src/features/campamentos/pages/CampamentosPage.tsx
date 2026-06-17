import { useEffect, useState } from "react";
import {
  Eye,
  FileText,
  Pencil,
  Trash2,
  Truck,
} from "lucide-react";
import Navbar from "../../../shared/components/Navbar";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import CampamentosForm from "../components/CampamentosForm";
import { PageModal } from "../../../shared/components/PageModal";
import { deleteCampamento, getCampamentos } from "../campamentos.api";
import type { Campamento } from "../types";
import { getPersonas } from "../../personas/personas.api";
import type { Persona } from "../../personas/types";
import { getResources } from "../../inventario/inventario.api";
import type { InventarioResource } from "../../inventario/types";
import SolicitudesPage from "../../solicitudes/pages/SolicitudesPage";
import EnviosPage from "../../envios/pages/EnviosPage";

type CampamentoTab = "lista" | "detalle" | "solicitudes" | "envios";

function CampamentosPage() {
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [inventario, setInventario] = useState<InventarioResource[]>([]);
  const [campamentoEditando, setCampamentoEditando] =
    useState<Campamento | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [selectedCampamentoId, setSelectedCampamentoId] =
    useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<CampamentoTab>("lista");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const campamentosActivos = campamentos.filter(
    (campamento) => campamento.activo !== false,
  );

  const selectedCampamento =
    campamentosActivos.find(
      (campamento) => campamento.id_campamento === selectedCampamentoId,
    ) ?? campamentosActivos[0];

  const selectedId = selectedCampamento?.id_campamento;

  const personasCampamento = selectedId
    ? personas.filter(
        (persona) =>
          persona.activo !== false && persona.id_campamento === selectedId,
      )
    : [];

  const inventarioCampamento = selectedId
    ? inventario.filter((resource) => resource.campId === selectedId)
    : [];

  const inventarioCritico = inventarioCampamento.filter(
    (resource) => resource.status === "critical",
  ).length;

  const getCampamentoStats = (idCampamento?: number) => {
    if (!idCampamento) {
      return { personas: 0, recursos: 0, alertas: 0 };
    }

    const recursos = inventario.filter(
      (resource) => resource.campId === idCampamento,
    );

    return {
      personas: personas.filter(
        (persona) =>
          persona.activo !== false && persona.id_campamento === idCampamento,
      ).length,
      recursos: recursos.length,
      alertas: recursos.filter((resource) => resource.status === "critical")
        .length,
    };
  };

  const loadCampamentos = async () => {
    setLoading(true);
    setError(null);

    try {
      const [campamentosData, personasData, inventarioData] =
        await Promise.all([getCampamentos(), getPersonas(), getResources()]);

      const activeCampamentos = campamentosData.filter(
        (campamento) => campamento.activo !== false,
      );

      setCampamentos(campamentosData);
      setPersonas(personasData);
      setInventario(inventarioData);

      setSelectedCampamentoId((currentId) => {
        const currentStillExists = activeCampamentos.some(
          (campamento) => campamento.id_campamento === currentId,
        );

        if (currentStillExists) return currentId;

        return activeCampamentos[0]?.id_campamento ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los campamentos.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCampamentos();
  }, []);

  const handleDelete = async (campamento: Campamento) => {
    if (!campamento.id_campamento) return;

    const confirmed = window.confirm(
      `Deseas desactivar el campamento "${campamento.nombre}"?`,
    );

    if (!confirmed) return;

    setIsDeletingId(campamento.id_campamento);
    setError(null);

    try {
      await deleteCampamento(campamento.id_campamento);

      if (campamentoEditando?.id_campamento === campamento.id_campamento) {
        setCampamentoEditando(null);
      }

      await loadCampamentos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el campamento.",
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  const selectCampamento = (campamento: Campamento, tab: CampamentoTab) => {
    setSelectedCampamentoId(campamento.id_campamento ?? null);
    setActiveTab(tab);
  };


  return (
    <div style={{ display: "flex", background: "#09110f", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <h1>Campamentos</h1>
              <p className="page-description">
                Administra campamentos por secciones para evitar saturar la
                pantalla.
              </p>
            </div>

            <div className="page-header-actions">
              <div className="campamentos-stat">
                <span className="stat-label">Activos</span>
                <strong className="stat-value">{campamentosActivos.length}</strong>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setCampamentoEditando(null);
                  setMostrarFormulario(true);
                }}
              >
                + Nuevo campamento
              </button>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="module-tabs">
            <button
              type="button"
              className={`module-tab${activeTab === "lista" ? " module-tab--active" : ""}`}
              onClick={() => setActiveTab("lista")}
            >
              Lista
            </button>

            <button
              type="button"
              className={`module-tab${activeTab === "detalle" ? " module-tab--active" : ""}`}
              disabled={!selectedCampamento}
              onClick={() => setActiveTab("detalle")}
            >
              Detalle
            </button>

            <button
              type="button"
              className={`module-tab${activeTab === "solicitudes" ? " module-tab--active" : ""}`}
              disabled={!selectedCampamento}
              onClick={() => setActiveTab("solicitudes")}
            >
              Solicitudes
            </button>

            <button
              type="button"
              className={`module-tab${activeTab === "envios" ? " module-tab--active" : ""}`}
              disabled={!selectedCampamento}
              onClick={() => setActiveTab("envios")}
            >
              Envíos
            </button>
          </section>

          {activeTab === "lista" && (
            <section className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Listado de campamentos</h3>
                  <p className="small-text">
                    Selecciona un campamento para ver detalle, editarlo o
                    gestionar solicitudes.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Cargando campamentos...</div>
              ) : campamentosActivos.length === 0 ? (
                <div className="empty-state">
                  No hay campamentos activos registrados.
                </div>
              ) : (
                <div className="campamentos-list">
                  {campamentosActivos.map((campamento) => {
                    const stats = getCampamentoStats(campamento.id_campamento);

                    return (
                      <article
                        key={campamento.id_campamento}
                        className={`campamento-card${
                          campamento.id_campamento === selectedId
                            ? " campamento-card-selected"
                            : ""
                        }`}
                      >
                      <div className="campamento-card-header">
                        <div>
                          <h4>{campamento.nombre}</h4>
                          <p className="campamento-meta">
                            {campamento.ubicacion?.trim() || "Sin ubicacion"}
                          </p>
                        </div>

                        <span className="status-badge status-active">
                          Activo
                        </span>
                      </div>

                      <p className="small-text">
                        {campamento.descripcion?.trim() ||
                          "Sin descripcion registrada."}
                      </p>

                        <div className="campamento-summary-grid">
                          <div className="campamento-summary-item">
                            <span>Personas</span>
                            <strong>{stats.personas}</strong>
                          </div>

                          <div className="campamento-summary-item">
                            <span>Recursos</span>
                            <strong>{stats.recursos}</strong>
                          </div>

                          <div className="campamento-summary-item">
                            <span>Alertas</span>
                            <strong>{stats.alertas}</strong>
                          </div>
                        </div>

                        <CrudActions layout="card">
                          <CrudActionGroup>
                            <CrudAction
                              label="Ver detalle"
                              icon={Eye}
                              onClick={() =>
                                selectCampamento(campamento, "detalle")
                              }
                            />
                            <CrudAction
                              label="Solicitudes"
                              icon={FileText}
                              onClick={() =>
                                selectCampamento(campamento, "solicitudes")
                              }
                            />
                          </CrudActionGroup>
                          <CrudActionGroup>
                            <CrudAction
                              label="Editar"
                              icon={Pencil}
                              variant="primary"
                              onClick={() => {
                                setCampamentoEditando(campamento);
                                setMostrarFormulario(true);
                              }}
                            />
                          </CrudActionGroup>
                          <CrudActionGroup>
                            <CrudAction
                              label={
                                isDeletingId === campamento.id_campamento
                                  ? "Eliminando..."
                                  : "Eliminar"
                              }
                              icon={Trash2}
                              variant="danger"
                              disabled={
                                isDeletingId === campamento.id_campamento
                              }
                              loading={isDeletingId === campamento.id_campamento}
                              onClick={() => void handleDelete(campamento)}
                            />
                          </CrudActionGroup>
                        </CrudActions>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "detalle" && selectedCampamento && (
            <section className="campamentos-detail-card">
              <div className="card-header card-toolbar">
                <div>
                  <span className="page-badge">Detalle del campamento</span>
                  <h3>{selectedCampamento.nombre}</h3>
                  <p className="small-text">
                    {selectedCampamento.ubicacion?.trim() ||
                      "Sin ubicacion registrada"}
                  </p>
                </div>

                <div className="card-toolbar-actions">
                  <CrudActions layout="inline">
                    <CrudActionGroup>
                      <CrudAction
                        label="Editar"
                        icon={Pencil}
                        variant="primary"
                        onClick={() => {
                          setCampamentoEditando(selectedCampamento);
                          setMostrarFormulario(true);
                        }}
                      />
                      <CrudAction
                        label="Solicitudes"
                        icon={FileText}
                        onClick={() =>
                          selectCampamento(selectedCampamento, "solicitudes")
                        }
                      />
                      <CrudAction
                        label="Envíos"
                        icon={Truck}
                        onClick={() =>
                          selectCampamento(selectedCampamento, "envios")
                        }
                      />
                    </CrudActionGroup>
                    <CrudActionGroup>
                      <CrudAction
                        label={
                          isDeletingId === selectedCampamento.id_campamento
                            ? "Eliminando..."
                            : "Eliminar"
                        }
                        icon={Trash2}
                        variant="danger"
                        disabled={
                          isDeletingId === selectedCampamento.id_campamento
                        }
                        loading={
                          isDeletingId === selectedCampamento.id_campamento
                        }
                        onClick={() => void handleDelete(selectedCampamento)}
                      />
                    </CrudActionGroup>
                  </CrudActions>
                </div>
              </div>

              {selectedCampamento.descripcion?.trim() && (
                <p className="section-description" style={{ marginBottom: 20 }}>
                  {selectedCampamento.descripcion.trim()}
                </p>
              )}

              <div className="campamento-summary-grid">
                <div className="campamento-summary-item">
                  <span>Personas</span>
                  <strong>{personasCampamento.length}</strong>
                </div>

                <div className="campamento-summary-item">
                  <span>Recursos</span>
                  <strong>{inventarioCampamento.length}</strong>
                </div>

                <div className="campamento-summary-item">
                  <span>Alertas</span>
                  <strong>{inventarioCritico}</strong>
                </div>
              </div>

              <section className="campamento-detail-section">
                <div className="detail-section-title">
                  <h4>Personas del campamento</h4>
                  <span>{personasCampamento.length} registros</span>
                </div>

                {personasCampamento.length === 0 ? (
                  <div className="empty-state">
                    No hay personas registradas en este campamento.
                  </div>
                ) : (
                  <div className="campamento-mini-list">
                    {personasCampamento.map((persona) => (
                      <article
                        key={persona.id_persona}
                        className="campamento-mini-card"
                      >
                        <strong>
                          {persona.nombre} {persona.apellidos}
                        </strong>
                        <span>Cedula: {persona.cedula}</span>
                        <span>Cargo: {persona.cargo?.nombre ?? "Sin cargo"}</span>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="campamento-detail-section">
                <div className="detail-section-title">
                  <h4>Recursos e inventario</h4>
                  <span>{inventarioCampamento.length} recursos</span>
                </div>

                {inventarioCampamento.length === 0 ? (
                  <div className="empty-state">
                    No hay inventario registrado en este campamento.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Recurso</th>
                          <th>Cantidad</th>
                          <th>Minimo</th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {inventarioCampamento.map((resource) => (
                          <tr key={`${resource.campId}-${resource.id}`}>
                            <td>{resource.name}</td>
                            <td>{resource.quantity}</td>
                            <td>{resource.minThreshold}</td>
                            <td>
                              <span
                                className={
                                  resource.status === "critical"
                                    ? "status-badge status-inactive"
                                    : "status-badge status-active"
                                }
                              >
                                {resource.status === "critical"
                                  ? "Critico"
                                  : "Estable"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          )}

          {mostrarFormulario && (
            <PageModal
              title={
                campamentoEditando ? "Editar campamento" : "Nuevo campamento"
              }
              onClose={() => {
                setMostrarFormulario(false);
                setCampamentoEditando(null);
              }}
              size="md"
            >
              <CampamentosForm
                campamentoEditando={campamentoEditando}
                onCancelEdit={() => {
                  setMostrarFormulario(false);
                  setCampamentoEditando(null);
                }}
                onSuccess={() => {
                  setMostrarFormulario(false);
                  setCampamentoEditando(null);
                  void loadCampamentos();
                }}
              />
            </PageModal>
          )}

          {activeTab === "solicitudes" && selectedCampamento && (
            <section className="campamentos-detail-card">
              <SolicitudesPage
                campamento={selectedCampamento}
                campamentos={campamentosActivos}
                inventario={inventario}
                personas={personas}
              />
            </section>
          )}

          {activeTab === "envios" && selectedCampamento && (
            <section className="campamentos-detail-card">
              <EnviosPage
                campamento={selectedCampamento}
                campamentos={campamentosActivos}
                personas={personas}
                inventario={inventario}
                onDataChanged={loadCampamentos}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default CampamentosPage;
