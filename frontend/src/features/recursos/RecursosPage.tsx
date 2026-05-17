import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "../../shared/components/Navbar";
import {
  createRecurso,
  deleteRecurso,
  getRecursos,
  updateRecurso,
} from "./recursos.api";
import type { CreateRecursoFormData, RecursoItem } from "./types";

const categories = [
  "COMIDA",
  "AGUA",
  "HIGIENE",
  "DEFENSA",
  "MUNICION",
  "MEDICINA",
  "OTRO",
];

const emptyForm: CreateRecursoFormData = {
  nombre: "",
  categoria: "COMIDA",
  unidad: "",
};

function RecursosPage() {
  const [recursos, setRecursos] = useState<RecursoItem[]>([]);
  const [form, setForm] = useState<CreateRecursoFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecursos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecursos();
      setRecursos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando recursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecursos();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId != null) {
        await updateRecurso(editingId, form);
      } else {
        await createRecurso(form);
      }
      resetForm();
      await loadRecursos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el recurso.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (recurso: RecursoItem) => {
    setEditingId(recurso.id_recurso);
    setForm({
      nombre: recurso.nombre,
      categoria: recurso.categoria,
      unidad: recurso.unidad,
    });
  };

  const handleDelete = async (recurso: RecursoItem) => {
    const confirmed = window.confirm(
      `Eliminar el recurso "${recurso.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteRecurso(recurso.id_recurso);
      await loadRecursos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el recurso.",
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
              <span className="page-badge">Catálogo de recursos</span>
              <h1>Recursos disponibles</h1>
              <p className="page-description">
                Gestiona el catálogo de recursos que pueden asignarse a inventarios
                y solicitudes.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Total</span>
              <strong className="stat-value">{recursos.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-grid">
            <div className="campamentos-list-card" style={{ minHeight: 320 }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div>
                  <h3>Listado de recursos</h3>
                  <p className="small-text">
                    Recursos creados en el catálogo del sistema.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Cargando recursos...</div>
              ) : recursos.length === 0 ? (
                <div className="empty-state">
                  No hay recursos registrados. Agrega uno nuevo.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Unidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recursos.map((recurso) => (
                        <tr key={recurso.id_recurso}>
                          <td>{recurso.nombre}</td>
                          <td>{recurso.categoria}</td>
                          <td>{recurso.unidad}</td>
                          <td>
                            <button
                              type="button"
                              className="button button-secondary"
                              onClick={() => handleEdit(recurso)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="button button-danger"
                              style={{ marginLeft: 8 }}
                              onClick={() => void handleDelete(recurso)}
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
                  <h3>{editingId != null ? "Editar recurso" : "Agregar recurso"}</h3>
                  <p className="section-description">
                    {editingId != null
                      ? "Actualiza la categoría o unidad del recurso."
                      : "Crea un nuevo recurso disponible para inventario y solicitudes."}
                  </p>
                </div>

                <label className="form-field">
                  <span>Nombre</span>
                  <input
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Categoría</span>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Unidad</span>
                  <input
                    name="unidad"
                    type="text"
                    value={form.unidad}
                    onChange={handleChange}
                    required
                  />
                </label>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="button button-primary" disabled={saving}>
                    {saving ? "Guardando..." : editingId != null ? "Actualizar" : "Crear"}
                  </button>
                  {editingId != null && (
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

export default RecursosPage;
