import { useEffect, useState } from "react";
import {
  createCargo,
  deleteCargo,
  getCargosCatalogo,
  updateCargo,
} from "../cargos.api";
import type { CargoFormData, PersonaCargo } from "../types";

interface Props {
  onChanged: () => void;
}

const emptyForm: CargoFormData = {
  nombre: "",
  descripcion: "",
};

export default function CargosManager({ onChanged }: Props) {
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [cargoEditando, setCargoEditando] = useState<PersonaCargo | null>(null);
  const [form, setForm] = useState<CargoFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCargos = async () => {
    setLoading(true);
    setError(null);

    try {
      setCargos(await getCargosCatalogo());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se cargaron cargos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCargos();
  }, []);

  const resetForm = () => {
    setCargoEditando(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setError("Debe ingresar el nombre del cargo.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (cargoEditando) {
        await updateCargo(cargoEditando.id_cargo, form);
      } else {
        await createCargo(form);
      }

      resetForm();
      await loadCargos();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se guardo el cargo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cargo: PersonaCargo) => {
    setCargoEditando(cargo);
    setForm({
      nombre: cargo.nombre,
      descripcion: cargo.descripcion ?? "",
    });
  };

  const handleDelete = async (cargo: PersonaCargo) => {
    const confirmed = window.confirm(`Deseas eliminar el cargo "${cargo.nombre}"?`);

    if (!confirmed) return;

    setDeletingId(cargo.id_cargo);
    setError(null);

    try {
      await deleteCargo(cargo.id_cargo);
      await loadCargos();
      onChanged();

      if (cargoEditando?.id_cargo === cargo.id_cargo) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se elimino el cargo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="campamentos-grid">
      <div className="campamentos-list-card">
        <div className="card-header">
          <div>
            <h3>Cargos registrados</h3>
            <p className="small-text">
              Administra los cargos disponibles para asignar personas.
            </p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="empty-state">Cargando cargos...</div>
        ) : cargos.length === 0 ? (
          <div className="empty-state">No hay cargos registrados.</div>
        ) : (
          <div className="campamentos-list">
            {cargos.map((cargo) => (
              <article key={cargo.id_cargo} className="campamento-card">
                <div className="campamento-card-header">
                  <div>
                    <h4>{cargo.nombre}</h4>
                    <p className="campamento-meta">
                      {cargo.descripcion?.trim() || "Sin descripcion"}
                    </p>
                  </div>
                </div>

                <div className="personas-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => handleEdit(cargo)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="button button-danger"
                    disabled={deletingId === cargo.id_cargo}
                    onClick={() => void handleDelete(cargo)}
                  >
                    {deletingId === cargo.id_cargo ? "Eliminando..." : "Eliminar"}
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
            <h3>{cargoEditando ? "Editar cargo" : "Nuevo cargo"}</h3>
            <p className="small-text">
              Crea cargos como exploradores, cocineros, guardias o medicos.
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

        <div className="personas-actions" style={{ marginTop: "18px" }}>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Guardando..." : cargoEditando ? "Actualizar" : "Crear"}
          </button>

          {cargoEditando && (
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
