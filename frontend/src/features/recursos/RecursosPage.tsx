import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Navbar from "../../shared/components/Navbar";
import { PageModal } from "../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../shared/components/CrudActions";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    buscar: "",
    categoria: "",
  });

  const debouncedBuscar = useDebouncedValue(filters.buscar);

  const recursosFiltrados = useMemo(() => {
    const buscar = debouncedBuscar.trim().toLowerCase();

    return recursos.filter((recurso) => {
      return (
        (!buscar || recurso.nombre.toLowerCase().includes(buscar)) &&
        (!filters.categoria || recurso.categoria === filters.categoria)
      );
    });
  }, [recursos, debouncedBuscar, filters.categoria]);

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
    setShowForm(false);
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
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
    setShowForm(true);
  };

  const handleDelete = async (recurso: RecursoItem) => {
    const confirmed = window.confirm(
      `Eliminar el recurso "${recurso.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(recurso.id_recurso);
    setError(null);

    try {
      await deleteRecurso(recurso.id_recurso);
      setRecursos((current) =>
        current.filter((item) => item.id_recurso !== recurso.id_recurso),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el recurso.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: "flex", background: "#09110f", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Catálogo de recursos</span>
              <h1>Recursos disponibles</h1>
              <p className="page-description">
                Gestiona el catálogo de recursos que pueden asignarse a
                inventarios y solicitudes.
              </p>
            </div>

            <div className="page-header-actions">
              <div className="campamentos-stat">
                <span className="stat-label">Total</span>
                <strong className="stat-value">{recursos.length}</strong>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={openCreateForm}
              >
                <Plus size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                Agregar recurso
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
                  placeholder="Nombre del recurso"
                />
              </label>

              <label className="filter-field">
                <span>Categoría</span>
                <select
                  value={filters.categoria}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      categoria: event.target.value,
                    }))
                  }
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="page-list-full">
            <div className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Listado de recursos</h3>
                  <p className="small-text">
                    Recursos creados en el catálogo del sistema.
                  </p>
                </div>
              </div>

              <div className="filter-results-meta">
                <span>
                  Mostrando <strong>{recursosFiltrados.length}</strong> de{" "}
                  <strong>{recursos.length}</strong> recursos
                </span>
              </div>

              {loading ? (
                <div className="empty-state">Cargando recursos...</div>
              ) : recursosFiltrados.length === 0 ? (
                <div className="empty-state">
                  {recursos.length === 0
                    ? "No hay recursos registrados. Agrega uno nuevo."
                    : "No hay recursos que coincidan con los filtros."}
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
                      {recursosFiltrados.map((recurso) => (
                        <tr key={recurso.id_recurso}>
                          <td>{recurso.nombre}</td>
                          <td>{recurso.categoria}</td>
                          <td>{recurso.unidad}</td>
                          <td className="table-actions-cell">
                            <CrudActions layout="table">
                              <CrudActionGroup>
                                <CrudAction
                                  label="Editar"
                                  icon={Pencil}
                                  variant="primary"
                                  onClick={() => handleEdit(recurso)}
                                />
                                <CrudAction
                                  label="Eliminar"
                                  icon={Trash2}
                                  variant="danger"
                                  loading={deletingId === recurso.id_recurso}
                                  loadingLabel="Eliminando..."
                                  onClick={() => void handleDelete(recurso)}
                                />
                              </CrudActionGroup>
                            </CrudActions>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {showForm && (
            <PageModal
              title={editingId != null ? "Editar recurso" : "Agregar recurso"}
              onClose={resetForm}
              size="sm"
            >
              <form className="modal-form" onSubmit={handleSubmit}>
                <p className="section-description">
                  {editingId != null
                    ? "Actualiza la categoría o unidad del recurso."
                    : "Crea un nuevo recurso disponible para inventario y solicitudes."}
                </p>

                <div className="modal-form__section">
                  <h3 className="modal-form__section-title">Datos del recurso</h3>

                  <label className="form-field">
                    <span>Nombre *</span>
                    <input
                      name="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </label>

                  <div className="modal-form__row">
                    <label className="form-field">
                      <span>Categoría *</span>
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
                      <span>Unidad *</span>
                      <input
                        name="unidad"
                        type="text"
                        value={form.unidad}
                        onChange={handleChange}
                        required
                        placeholder="Ej: kg, litros, unidades"
                      />
                    </label>
                  </div>
                </div>

                <div className="modal-form__actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                  <button className="button button-primary" disabled={saving}>
                    {saving
                      ? "Guardando..."
                      : editingId != null
                        ? "Actualizar"
                        : "Crear"}
                  </button>
                </div>
              </form>
            </PageModal>
          )}
        </main>
      </div>
    </div>
  );
}

export default RecursosPage;
