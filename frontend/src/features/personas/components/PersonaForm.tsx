import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createPersona, updatePersona } from "../personas.api";
import type { Persona, PersonaCampamento, PersonaFormData } from "../types";

interface Props {
  onSuccess: () => void;
  personaEditando?: Persona | null;
  campamentos: PersonaCampamento[];
  onCancelEdit?: () => void;
}

interface ValidationErrors {
  id_campamento?: string;
  cedula?: string;
  nombre?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
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
};

const normalizeDateInput = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
};

export default function PersonaForm({
  onSuccess,
  personaEditando,
  campamentos,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState<PersonaFormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (personaEditando) {
      setForm({
        id_campamento: String(personaEditando.id_campamento),
        cedula: personaEditando.cedula,
        nombre: personaEditando.nombre,
        apellidos: personaEditando.apellidos,
        fecha_nacimiento: normalizeDateInput(personaEditando.fecha_nacimiento),
        foto_url: personaEditando.foto_url ?? "",
        imagen_carnet_url: personaEditando.imagen_carnet_url ?? "",
        codigo_campamento: personaEditando.codigo_campamento ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [personaEditando]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!form.id_campamento) {
      errors.id_campamento = "Selecciona un campamento";
    }

    if (!form.cedula.trim()) {
      errors.cedula = "La cedula es obligatoria";
    } else if (form.cedula.trim().length < 4) {
      errors.cedula = "La cedula debe tener al menos 4 caracteres";
    }

    if (!form.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (form.nombre.trim().length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!form.apellidos.trim()) {
      errors.apellidos = "Los apellidos son obligatorios";
    } else if (form.apellidos.trim().length < 2) {
      errors.apellidos = "Los apellidos deben tener al menos 2 caracteres";
    }

    if (
      form.fecha_nacimiento &&
      Number.isNaN(Date.parse(form.fecha_nacimiento))
    ) {
      errors.fecha_nacimiento = "La fecha de nacimiento no es valida";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setIsSaving(true);

    try {
      if (personaEditando?.id_persona) {
        await updatePersona(personaEditando.id_persona, form);
      } else {
        await createPersona(form);
      }

      setForm(emptyForm);
      onSuccess();
      onCancelEdit?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la persona.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="campamentos-form" onSubmit={handleSubmit}>
      <div className="form-section-header">
        <h3>{personaEditando ? "Editar persona" : "Nueva persona"}</h3>
        <p className="section-description">
          {personaEditando
            ? "Actualiza la informacion personal y su campamento."
            : "Registra una nueva persona dentro de un campamento activo."}
        </p>
      </div>

      <label className="form-field">
        <span>Campamento</span>
        <select
          name="id_campamento"
          value={form.id_campamento}
          onChange={handleChange}
          className={fieldErrors.id_campamento ? "input-error" : ""}
        >
          <option value="">Selecciona un campamento</option>
          {campamentos.map((campamento) => (
            <option
              key={campamento.id_campamento}
              value={campamento.id_campamento}
            >
              {campamento.nombre}
            </option>
          ))}
        </select>
        {fieldErrors.id_campamento && (
          <span className="field-error">{fieldErrors.id_campamento}</span>
        )}
      </label>

      <label className="form-field">
        <span>Cedula</span>
        <input
          name="cedula"
          value={form.cedula}
          onChange={handleChange}
          className={fieldErrors.cedula ? "input-error" : ""}
        />
        {fieldErrors.cedula && (
          <span className="field-error">{fieldErrors.cedula}</span>
        )}
      </label>

      <label className="form-field">
        <span>Nombre</span>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className={fieldErrors.nombre ? "input-error" : ""}
        />
        {fieldErrors.nombre && (
          <span className="field-error">{fieldErrors.nombre}</span>
        )}
      </label>

      <label className="form-field">
        <span>Apellidos</span>
        <input
          name="apellidos"
          value={form.apellidos}
          onChange={handleChange}
          className={fieldErrors.apellidos ? "input-error" : ""}
        />
        {fieldErrors.apellidos && (
          <span className="field-error">{fieldErrors.apellidos}</span>
        )}
      </label>

      <label className="form-field">
        <span>Fecha de nacimiento</span>
        <input
          type="date"
          name="fecha_nacimiento"
          value={form.fecha_nacimiento}
          onChange={handleChange}
          className={fieldErrors.fecha_nacimiento ? "input-error" : ""}
        />
        {fieldErrors.fecha_nacimiento && (
          <span className="field-error">{fieldErrors.fecha_nacimiento}</span>
        )}
      </label>

      <label className="form-field">
        <span>Codigo interno</span>
        <input
          name="codigo_campamento"
          value={form.codigo_campamento}
          onChange={handleChange}
          placeholder="Opcional"
        />
      </label>

      <label className="form-field">
        <span>URL de foto</span>
        <input
          name="foto_url"
          value={form.foto_url}
          onChange={handleChange}
          placeholder="https://..."
        />
      </label>

      <label className="form-field">
        <span>URL de carnet</span>
        <input
          name="imagen_carnet_url"
          value={form.imagen_carnet_url}
          onChange={handleChange}
          placeholder="https://..."
        />
      </label>

      {error && <div className="error-box">{error}</div>}

      <button
        className="button button-primary"
        disabled={isSaving || campamentos.length === 0}
      >
        {isSaving
          ? "Guardando..."
          : personaEditando?.id_persona
            ? "Actualizar"
            : "Guardar"}
      </button>

      {personaEditando && (
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setForm(emptyForm);
            onCancelEdit?.();
          }}
        >
          Cancelar edicion
        </button>
      )}
    </form>
  );
}
