import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createCampamento, updateCampamento } from "../campamentos.api";
import type { Campamento, CampamentoFormData } from "../types";

interface Props {
  onSuccess: () => void;
  campamentoEditando?: Campamento | null;
  onCancelEdit?: () => void;
}

interface ValidationErrors {
  nombre?: string;
  ubicacion?: string;
}

const emptyForm: CampamentoFormData = {
  nombre: "",
  ubicacion: "",
  descripcion: "",
};

export default function CampamentosForm({
  onSuccess,
  campamentoEditando,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState<CampamentoFormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (campamentoEditando) {
      setForm({
        nombre: campamentoEditando.nombre,
        ubicacion: campamentoEditando.ubicacion ?? "",
        descripcion: campamentoEditando.descripcion ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [campamentoEditando]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!form.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (form.nombre.trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (form.ubicacion.trim() && form.ubicacion.trim().length < 3) {
      errors.ubicacion = "La ubicacion debe tener al menos 3 caracteres";
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
      if (campamentoEditando?.id_campamento) {
        await updateCampamento(campamentoEditando.id_campamento, form);
      } else {
        await createCampamento(form);
      }

      setForm(emptyForm);
      onSuccess();
      onCancelEdit?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el campamento.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="campamentos-form" onSubmit={handleSubmit}>
      <div className="form-section-header">
        <h3>{campamentoEditando ? "Editar campamento" : "Nuevo campamento"}</h3>
        <p className="section-description">
          {campamentoEditando
            ? "Modifica los datos del campamento."
            : "Completa los campos para crear uno nuevo."}
        </p>
      </div>

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
        <span>Ubicacion</span>
        <input
          name="ubicacion"
          value={form.ubicacion}
          onChange={handleChange}
          className={fieldErrors.ubicacion ? "input-error" : ""}
        />
        {fieldErrors.ubicacion && (
          <span className="field-error">{fieldErrors.ubicacion}</span>
        )}
      </label>

      <label className="form-field">
        <span>Descripcion</span>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
        />
      </label>

      {error && <div className="error-box">{error}</div>}

      <button className="button button-primary" disabled={isSaving}>
        {isSaving
          ? "Guardando..."
          : campamentoEditando?.id_campamento
            ? "Actualizar"
            : "Guardar"}
      </button>

      {campamentoEditando && (
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
