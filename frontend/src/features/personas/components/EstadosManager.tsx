import { useEffect, useState } from "react";
import {
  createEstadoPersona,
  deleteEstadoPersona,
  getEstadosPersonaCatalogo,
  updateEstadoPersona,
} from "../estadosPersona.api";
import type { EstadoPersonaFormData, PersonaEstado } from "../types";

interface Props {
  onChanged: () => void;
}

const emptyForm: EstadoPersonaFormData = {
  nombre: "",
  descripcion: "",
  disponible: true,
};

export default function EstadosManager({ onChanged }: Props) {
  const [estados, setEstados] = useState<PersonaEstado[]>([]);
  const [estadoEditando, setEstadoEditando] = useState<PersonaEstado | null>(
    null,
  );
  const [form, setForm] = useState<EstadoPersonaFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEstados = async () => {
    setLoading(true);
    setError(null);

    try {
      setEstados(await getEstadosPersonaCatalogo());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se cargaron estados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEstados();
  }, []);

  const resetForm = () => {
    setEstadoEditando(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setError("Debe ingresar el nombre del estado.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (estadoEditando) {
        await updateEstadoPersona(estadoEditando.id_estado, form);
      } else {
        await createEstadoPersona(form);
      }

      resetForm();
      await loadEstados();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se guardo el estado.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (estado: PersonaEstado) => {
    setEstadoEditando(estado);
    setForm({
      nombre: estado.nombre,
      descripcion: estado.descripcion ?? "",
      disponible: estado.disponible ?? true,
    });
  };

  const handleDelete = async (estado: PersonaEstado) => {
    const confirmed = window.confirm(
      `Deseas eliminar el estado "${estado.nombre}"?`,
    );

    if (!confirmed) return;

    setDeletingId(estado.id_estado);
    setError(null);

    try {
      await deleteEstadoPersona(estado.id_estado);
      await loadEstados();
      onChanged();

      if (estadoEditando?.id_estado === estado.id_estado) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se elimino el estado.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="campamentos-grid">
      <div className="campamentos-list-card">
        <div className="card-header">
          <div>
            <h3>Estados registrados</h3>
            <p className="small-text">
              Administra la disponibilidad y condicion de las personas.
            </p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="empty-state">Cargando estados...</div>
        ) : estados.length === 0 ? (
          <div className="empty-state">No hay estados registrados.</div>
        ) : (
          <div className="campamentos-list">
            {estados.map((estado) => (
              <article key={estado.id_estado} className="campamento-card">
                <div className="campamento-card-header">
                  <div>
                    <h4>{estado.nombre}</h4>
                    <p className="campamento-meta">
                      {estado.descripcion?.trim() || "Sin descripcion"}
                    </p>
                  </div>
                  <span
                    className={
                      estado.disponible
                        ? "status-badge status-active"
                        : "status-badge status-inactive"
                    }
                  >
                    {estado.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>

                <div className="personas-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => handleEdit(estado)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="button button-danger"
                    disabled={deletingId === estado.id_estado}
                    onClick={() => void handleDelete(estado)}
                  >
                    {deletingId === estado.id_estado
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="campamentos-form-card" onSubmit={handleSubmit}>
        <div className="card-header">
          <div>
            <h3>{estadoEditando ? "Editar estado" : "Nuevo estado"}</h3>
            <p className="small-text">
              Define estados como disponible, herido, en mision o enfermo.
            </p>
          </div>
        </div>

        <label className="form-field">
          <span>Nombre</span>
          <input
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
          />
        </label>

        <label className="form-field">
          <span>Descripcion</span>
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                descripcion: event.target.value,
              }))
            }
          />
        </label>

        <label className="filter-flag" style={{ marginTop: "14px" }}>
          <input
            type="checkbox"
            checked={form.disponible}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                disponible: event.target.checked,
              }))
            }
          />
          <span>Disponible para asignaciones</span>
        </label>

        <div className="personas-actions" style={{ marginTop: "18px" }}>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Guardando..." : estadoEditando ? "Actualizar" : "Crear"}
          </button>

          {estadoEditando && (
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
    </section>
  );
}
