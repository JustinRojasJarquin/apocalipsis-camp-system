import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "../../shared/components/Navbar";
import {
  createResource,
  deleteResource,
  getAvailableResources,
  getResources,
  updateResource,
} from "./inventario.api";
import type {
  InventarioFormData,
  InventarioResource,
  RecursoOption,
} from "./types";

interface CampamentoOption {
  id_campamento: number;
  nombre: string;
}

const emptyForm: InventarioFormData = {
  campId: 0,
  resourceId: 0,
  quantity: 0,
  minThreshold: 0,
};

function InventarioPage() {
  const [resources, setResources] = useState<InventarioResource[]>([]);
  const [campamentos, setCampamentos] = useState<CampamentoOption[]>([]);
  const [availableResources, setAvailableResources] = useState<RecursoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<InventarioFormData>(emptyForm);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [campamentoFilter, setCampamentoFilter] = useState<number | undefined>(undefined);

  const loadResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getResources(campamentoFilter);
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando inventario.");
    } finally {
      setLoading(false);
    }
  };

  const loadCampamentos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/campamentos");
      const data = await res.json();
      if (res.ok) {
        setCampamentos(data);
      }
    } catch {
      // fallback silencioso si no está disponible.
    }
  };

  const loadAvailableResources = async () => {
    try {
      const data = await getAvailableResources();
      setAvailableResources(data);
    } catch {
      // fallback silencioso si no está disponible.
    }
  };

  useEffect(() => {
    void loadCampamentos();
    void loadAvailableResources();
  }, []);

  useEffect(() => {
    void loadResources();
  }, [campamentoFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingKey(null);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingKey) {
        const [campId, resourceId] = editingKey.split("-").map(Number);
        await updateResource(campId, resourceId, {
          quantity: form.quantity,
          minThreshold: form.minThreshold,
        });
      } else {
        await createResource(form);
      }
      resetForm();
      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el recurso de inventario.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (resource: InventarioResource) => {
    setForm({
      campId: resource.campId,
      resourceId: resource.id,
      quantity: resource.quantity,
      minThreshold: resource.minThreshold,
    });
    setEditingKey(`${resource.campId}-${resource.id}`);
  };

  const handleDelete = async (resource: InventarioResource) => {
    const confirmed = window.confirm(
      `Eliminar el recurso ${resource.name} del campamento ${resource.campamentoNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await deleteResource(resource.campId, resource.id);
      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el recurso de inventario.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Modulo inventario</span>
              <h1>Inventario de campamentos</h1>
              <p className="page-description">
                Administra el inventario por campamento. Solo el inventario de
                campamentos está activo en este módulo.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Registros</span>
              <strong className="stat-value">{resources.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-grid">
            <div className="campamentos-list-card" style={{ minHeight: 320 }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div>
                  <h3>Recursos</h3>
                  <p className="small-text">
                    Listado de recursos disponibles por campamento.
                  </p>
                </div>

                <label className="form-field" style={{ margin: 0 }}>
                  <span>Filtro campamento</span>
                  <select
                    value={campamentoFilter ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCampamentoFilter(value ? Number(value) : undefined);
                    }}
                  >
                    <option value="">Todos</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="empty-state">Cargando recursos...</div>
              ) : resources.length === 0 ? (
                <div className="empty-state">
                  No hay registros de inventario disponibles.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Recurso</th>
                        <th>Campamento</th>
                        <th>Cantidad</th>
                        <th>Umbral</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={`${resource.campId}-${resource.id}`}>
                          <td>{resource.name}</td>
                          <td>{resource.campamentoNombre || resource.campId}</td>
                          <td>{resource.quantity}</td>
                          <td>{resource.minThreshold}</td>
                          <td>{resource.status}</td>
                          <td>
                            <button
                              type="button"
                              className="button button-secondary"
                              onClick={() => handleEdit(resource)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="button button-danger"
                              onClick={() => void handleDelete(resource)}
                              style={{ marginLeft: 8 }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="campamentos-form-card">
              <form className="campamentos-form" onSubmit={handleSubmit}>
                <div className="form-section-header">
                  <h3>{editingKey ? "Editar recurso" : "Agregar recurso"}</h3>
                  <p className="section-description">
                    {editingKey
                      ? "Actualiza la cantidad o el umbral del inventario."
                      : "Registra un nuevo recurso en un campamento."}
                  </p>
                </div>

                <label className="form-field">
                  <span>Campamento</span>
                  <select
                    name="campId"
                    value={form.campId}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingKey)}
                  >
                    <option value={0}>Selecciona un campamento</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Recurso</span>
                  <select
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingKey)}
                  >
                    <option value={0}>Selecciona un recurso</option>
                    {availableResources.map((resource) => (
                      <option key={resource.id_recurso} value={resource.id_recurso}>
                        {resource.nombre}
                      </option>
                    ))}
                  </select>
                  <small>
                    Selecciona el recurso existente. Solo se edita cantidad y umbral.
                  </small>
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    name="quantity"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Umbral mínimo</span>
                  <input
                    name="minThreshold"
                    type="number"
                    min={0}
                    value={form.minThreshold}
                    onChange={handleChange}
                    required
                  />
                </label>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="button button-primary" disabled={isSaving}>
                    {isSaving ? "Guardando..." : editingKey ? "Actualizar" : "Crear"}
                  </button>

                  {editingKey && (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default InventarioPage;
