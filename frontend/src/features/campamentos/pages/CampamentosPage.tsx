import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import CampamentosForm from "../components/CampamentosForm";
import { deleteCampamento, getCampamentos } from "../campamentos.api";
import type { Campamento } from "../types";
import { getPersonas } from "../../personas/personas.api";
import type { Persona } from "../../personas/types";
import { getResources } from "../../inventario/inventario.api";
import type { InventarioResource } from "../../inventario/types";

function CampamentosPage() {
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [inventario, setInventario] = useState<InventarioResource[]>([]);
  const [campamentoEditando, setCampamentoEditando] = useState<Campamento | null>(
    null,
  );
  const [selectedCampamentoId, setSelectedCampamentoId] = useState<number | null>(
    null,
  );
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

  const loadCampamentos = async () => {
    setLoading(true);
    setError(null);

    try {
      const [campamentosData, personasData, inventarioData] = await Promise.all([
        getCampamentos(),
        getPersonas(),
        getResources(),
      ]);
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

        if (currentStillExists) {
          return currentId;
        }

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
    if (!campamento.id_campamento) {
      return;
    }

    const confirmed = window.confirm(
      `Deseas desactivar el campamento "${campamento.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

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

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      

      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <h1>Campamentos</h1>
              <p className="page-description">
                Administra los campamentos activos, crea nuevos registros y
                actualiza la informacion principal del modulo.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Activos</span>
              <strong className="stat-value">{campamentosActivos.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-grid">
            {selectedCampamento && (
              <div className="campamentos-detail-card">
                <div className="card-header">
                  <div>
                    <span className="page-badge">Informacion solicitada</span>
                    <h3>{selectedCampamento.nombre}</h3>
                    <p className="small-text">
                      {selectedCampamento.ubicacion?.trim() ||
                        "Sin ubicacion registrada"}
                    </p>
                  </div>
                </div>

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
                          <span>
                            Cargo: {persona.cargo?.nombre ?? "Sin cargo"}
                          </span>
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
              </div>
            )}

            <div className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Listado</h3>
                  <p className="small-text">
                    Consulta, edita o desactiva los campamentos disponibles.
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
                  {campamentosActivos.map((campamento) => (
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

                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "18px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() =>
                            setSelectedCampamentoId(
                              campamento.id_campamento ?? null,
                            )
                          }
                        >
                          Ver informacion
                        </button>

                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => {
                            setSelectedCampamentoId(
                              campamento.id_campamento ?? null,
                            );
                            setCampamentoEditando(campamento);
                          }}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="button button-danger"
                          disabled={isDeletingId === campamento.id_campamento}
                          onClick={() => void handleDelete(campamento)}
                        >
                          {isDeletingId === campamento.id_campamento
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="campamentos-form-card">
              <CampamentosForm
                campamentoEditando={campamentoEditando}
                onCancelEdit={() => setCampamentoEditando(null)}
                onSuccess={() => {
                  setCampamentoEditando(null);
                  void loadCampamentos();
                }}
              />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CampamentosPage;
