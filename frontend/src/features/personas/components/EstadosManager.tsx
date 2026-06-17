import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageModal } from "../../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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
    setMostrarFormulario(false);
  };

  const abrirCrear = () => {
    setEstadoEditando(null);
    setForm(emptyForm);
    setMostrarFormulario(true);
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
    setMostrarFormulario(true);
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
    <section className="campamentos-list-card">
      <div className="card-header">
        <div>
          <h3>Estados registrados</h3>
          <p className="small-text">
            Administra la disponibilidad y condicion de las personas.
          </p>
        </div>

        <button type="button" className="button button-primary" onClick={abrirCrear}>
          <Plus size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
          Nuevo estado
        </button>
      </div>

      {error && !mostrarFormulario && <div className="error-box">{error}</div>}

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

              <CrudActions layout="card">
                <CrudActionGroup>
                  <CrudAction
                    label="Editar"
                    icon={Pencil}
                    variant="primary"
                    onClick={() => handleEdit(estado)}
                  />
                </CrudActionGroup>
                <CrudActionGroup>
                  <CrudAction
                    label={
                      deletingId === estado.id_estado
                        ? "Eliminando..."
                        : "Eliminar"
                    }
                    icon={Trash2}
                    variant="danger"
                    disabled={deletingId === estado.id_estado}
                    loading={deletingId === estado.id_estado}
                    onClick={() => void handleDelete(estado)}
                  />
                </CrudActionGroup>
              </CrudActions>
            </article>
          ))}
        </div>
      )}

      {mostrarFormulario && (
        <PageModal
          title={estadoEditando ? "Editar estado" : "Nuevo estado"}
          onClose={resetForm}
          size="sm"
        >
          <form className="modal-form" onSubmit={handleSubmit}>
            <p className="section-description">
              Define estados como disponible, herido, en mision o enfermo.
            </p>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Datos del estado</h3>

              <label className="form-field">
                <span>Nombre *</span>
                <input
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nombre: event.target.value }))
                  }
                  autoFocus
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
                  placeholder="Condiciones o restricciones del estado"
                />
              </label>

              <label className="filter-flag">
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
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="modal-form__actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? "Guardando..." : estadoEditando ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </PageModal>
      )}
    </section>
  );
}
