import { useEffect, useState } from "react";
import {
  createPersona,
  getCargos,
  getEstados,
  updatePersona,
} from "../personas.api";
import type {
  Persona,
  PersonaCampamento,
  PersonaCargo,
  PersonaEstado,
  PersonaFormData,
} from "../types";

interface Props {
  campamentos: PersonaCampamento[];
  personaEditando: Persona | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}

const emptyForm: PersonaFormData = {
  id_campamento: "",
  cedula: "",
  nombre: "",
  apellidos: "",
  fecha_nacimiento: "",
  foto_url: "",
  imagen_carnet_url: "",
  codigo_campamento: "",
  id_cargo_actual: "",
  id_estado_actual: "",
};

function PersonaForm({
  campamentos,
  personaEditando,
  onCancelEdit,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<PersonaFormData>(emptyForm);
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [estados, setEstados] = useState<PersonaEstado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [cargosData, estadosData] = await Promise.all([
          getCargos(),
          getEstados(),
        ]);

        setCargos(cargosData);
        setEstados(estadosData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar cargos o estados.",
        );
      }
    };

    void loadCatalogos();
  }, []);

  useEffect(() => {
    if (!personaEditando) {
      setForm(emptyForm);
      return;
    }

    setForm({
      id_campamento: String(personaEditando.id_campamento ?? ""),
      cedula: personaEditando.cedula ?? "",
      nombre: personaEditando.nombre ?? "",
      apellidos: personaEditando.apellidos ?? "",
      fecha_nacimiento: personaEditando.fecha_nacimiento
        ? personaEditando.fecha_nacimiento.slice(0, 10)
        : "",
      foto_url: personaEditando.foto_url ?? "",
      imagen_carnet_url: personaEditando.imagen_carnet_url ?? "",
      codigo_campamento: personaEditando.codigo_campamento ?? "",
      id_cargo_actual: personaEditando.id_cargo_actual
        ? String(personaEditando.id_cargo_actual)
        : "",
      id_estado_actual: personaEditando.id_estado_actual
        ? String(personaEditando.id_estado_actual)
        : "",
    });
  }, [personaEditando]);

  const handleChange = (
    field: keyof PersonaFormData,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.id_campamento) {
      return "Debe seleccionar un campamento.";
    }

    if (!form.cedula.trim()) {
      return "Debe ingresar la cedula.";
    }

    if (!form.nombre.trim()) {
      return "Debe ingresar el nombre.";
    }

    if (!form.apellidos.trim()) {
      return "Debe ingresar los apellidos.";
    }

    if (!form.id_cargo_actual) {
      return "Debe seleccionar un cargo.";
    }

    if (!form.id_estado_actual) {
      return "Debe seleccionar un estado.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (personaEditando?.id_persona) {
        await updatePersona(personaEditando.id_persona, form);
      } else {
        await createPersona(form);
      }

      setForm(emptyForm);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la persona.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h3>{personaEditando ? "Editar persona" : "Nueva persona"}</h3>
          <p className="small-text">
            Registra la información personal, campamento, cargo y estado.
          </p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <label className="form-field">
        <span>Campamento</span>
        <select
          value={form.id_campamento}
          onChange={(event) =>
            handleChange("id_campamento", event.target.value)
          }
        >
          <option value="">Seleccione un campamento</option>
          {campamentos.map((campamento) => (
            <option
              key={campamento.id_campamento}
              value={campamento.id_campamento}
            >
              {campamento.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Cedula</span>
        <input
          value={form.cedula}
          onChange={(event) => handleChange("cedula", event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Nombre</span>
        <input
          value={form.nombre}
          onChange={(event) => handleChange("nombre", event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Apellidos</span>
        <input
          value={form.apellidos}
          onChange={(event) => handleChange("apellidos", event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Fecha nacimiento</span>
        <input
          type="date"
          value={form.fecha_nacimiento}
          onChange={(event) =>
            handleChange("fecha_nacimiento", event.target.value)
          }
        />
      </label>

      <label className="form-field">
        <span>Cargo</span>
        <select
          value={form.id_cargo_actual}
          onChange={(event) =>
            handleChange("id_cargo_actual", event.target.value)
          }
        >
          <option value="">Seleccione un cargo</option>
          {cargos.map((cargo) => (
            <option key={cargo.id_cargo} value={cargo.id_cargo}>
              {cargo.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Estado</span>
        <select
          value={form.id_estado_actual}
          onChange={(event) =>
            handleChange("id_estado_actual", event.target.value)
          }
        >
          <option value="">Seleccione un estado</option>
          {estados.map((estado) => (
            <option key={estado.id_estado} value={estado.id_estado}>
              {estado.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Codigo campamento</span>
        <input
          value={form.codigo_campamento}
          onChange={(event) =>
            handleChange("codigo_campamento", event.target.value)
          }
        />
      </label>

      <label className="form-field">
        <span>Foto URL</span>
        <input
          value={form.foto_url}
          onChange={(event) => handleChange("foto_url", event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Imagen carnet URL</span>
        <input
          value={form.imagen_carnet_url}
          onChange={(event) =>
            handleChange("imagen_carnet_url", event.target.value)
          }
        />
      </label>

      <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
        <button
          type="submit"
          className="button button-primary"
          disabled={saving}
        >
          {saving
            ? "Guardando..."
            : personaEditando
              ? "Actualizar"
              : "Crear"}
        </button>

        {personaEditando && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setForm(emptyForm);
              onCancelEdit();
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default PersonaForm;