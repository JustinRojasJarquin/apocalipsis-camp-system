import { useEffect, useState } from "react";
import { getCampamentos, deleteCampamento } from "../campamentos.api";
import CampamentosForm from "../components/CampamentosForm";
import type { Campamento } from "../types";

export default function CampamentosPage() {
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 🔥 NUEVO: estado para editar
  const [campamentoEditando, setCampamentoEditando] =
    useState<Campamento | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getCampamentos();
      setCampamentos(data);
      setError(null);
    } catch {
      setError("No se pudieron cargar los campamentos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const eliminar = async (id: number) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este campamento?",
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await deleteCampamento(id);
      await cargar();
    } catch {
      setError("No se pudo eliminar el campamento. Intenta nuevamente.");
    } finally {
      setDeletingId(null);
    }
  };

  // 🔥 NUEVO: seleccionar para editar
  const seleccionar = (c: Campamento) => {
    setCampamentoEditando(c);
  };

  return (
    <div className="campamentos-page">
      <header className="campamentos-header">
        <div>
          <p className="page-badge">Campamentos</p>
          <h2>Gestión de campamentos</h2>
          <p className="page-description">
            Aquí puedes crear, listar, editar y eliminar campamentos.
          </p>
        </div>

        <div className="campamentos-stat">
          <span className="stat-label">Total campamentos</span>
          <strong className="stat-value">{campamentos.length}</strong>
        </div>
      </header>

      <div className="campamentos-grid">
        <section className="campamentos-list-card">
          <div className="card-header">
            <div>
              <h3>Campamentos registrados</h3>
              <p className="small-text">Total: {campamentos.length}</p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loading ? (
            <div className="empty-state">Cargando campamentos...</div>
          ) : campamentos.length === 0 ? (
            <div className="empty-state">
              No hay campamentos registrados en este momento.
            </div>
          ) : (
            <div className="campamentos-list">
              {campamentos.map((campamento) => (
                <article
                  key={campamento.id_campamento}
                  className="campamento-card"
                >
                  <div className="campamento-card-header">
                    <div>
                      <h4>{campamento.nombre}</h4>
                      <p className="campamento-meta">
                        {campamento.ubicacion || "Ubicación no definida"}
                      </p>
                    </div>

                    {/* 🔥 BOTONES */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => seleccionar(campamento)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="button button-danger"
                        disabled={deletingId === campamento.id_campamento}
                        onClick={() =>
                          campamento.id_campamento &&
                          eliminar(campamento.id_campamento)
                        }
                      >
                        {deletingId === campamento.id_campamento
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </div>

                  <p>{campamento.descripcion || "Sin descripción"}</p>

                  <span
                    className={
                      "status-badge " +
                      (campamento.activo ? "status-active" : "status-inactive")
                    }
                  >
                    {campamento.activo ? "Activo" : "Inactivo"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="campamentos-form-card">
          <CampamentosForm
            onSuccess={cargar}
            campamentoEditando={campamentoEditando}
            onCancelEdit={() => setCampamentoEditando(null)}
          />
        </aside>
      </div>
    </div>
  );
}
