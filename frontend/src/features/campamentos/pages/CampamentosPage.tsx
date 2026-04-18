import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import CampamentosForm from "../components/CampamentosForm";
import { deleteCampamento, getCampamentos } from "../campamentos.api";
import type { Campamento } from "../types";

function CampamentosPage() {
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [campamentoEditando, setCampamentoEditando] = useState<Campamento | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const campamentosActivos = campamentos.filter(
    (campamento) => campamento.activo !== false,
  );

  const loadCampamentos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCampamentos();
      setCampamentos(data);
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
                      className="campamento-card"
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
                          className="button button-primary"
                          onClick={() => setCampamentoEditando(campamento)}
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
