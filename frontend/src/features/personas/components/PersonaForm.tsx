import { useEffect, useState } from "react";
import {
  createPersona,
  getCargos,
  getEstados,
  updatePersona,
  recomendarCargoIA,
  assignCargoByIA,
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
  idCampamentoFijo?: number | null;
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
  idCampamentoFijo,
}: Props) {
  const [form, setForm] = useState<PersonaFormData>(emptyForm);
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [estados, setEstados] = useState<PersonaEstado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<{
    recommendedCargoId: number;
    recommendedCargoName: string;
    reason: string;
  } | null>(null);

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
      setForm({
        ...emptyForm,
        id_campamento: idCampamentoFijo ? String(idCampamentoFijo) : "",
      });
      return;
    }

    setForm({
      id_campamento: idCampamentoFijo ? String(idCampamentoFijo) : String(personaEditando.id_campamento ?? ""),
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
  }, [personaEditando, idCampamentoFijo]);

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
    if (!idCampamentoFijo && !form.id_campamento) {
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

    if (!form.id_estado_actual) {
      return "Debe seleccionar un estado.";
    }

    return null;
  };

  const handleAsignarCargoIA = async () => {
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      setError("Complete nombre y apellidos antes de usar la IA.");
      return;
    }

    // Si está editando y ya tiene un cargo definido, preguntar antes de sobrescribir
    if (personaEditando?.id_persona && form.id_cargo_actual) {
      const confirmar = window.confirm(
        "La persona ya tiene un cargo asignado. ¿Desea reemplazarlo con la recomendación de IA?"
      );
      if (!confirmar) return;
    }

    setIaLoading(true);
    setIaResult(null);
    setError(null);

    try {
      let result: {
        recommendedCargoId: number;
        recommendedCargoName: string;
        reason: string;
      };

      if (personaEditando?.id_persona) {
        // Para persona existente, usar el endpoint que asigna y persiste
        const fullResult = await assignCargoByIA(personaEditando.id_persona);
        result = {
          recommendedCargoId: fullResult.recommendedCargoId,
          recommendedCargoName: fullResult.recommendedCargoName,
          reason: fullResult.reason,
        };
      } else {
        // Para persona nueva, solo recomendar sin persistir
        result = await recomendarCargoIA({
          persona: `${form.nombre.trim()} ${form.apellidos.trim()}`,
          campamento: form.id_campamento
            ? campamentos.find(c => String(c.id_campamento) === form.id_campamento)?.nombre
            : undefined,
        });
      }

      if (result.recommendedCargoId) {
        setForm((current) => ({
          ...current,
          id_cargo_actual: String(result.recommendedCargoId),
        }));
      }

      setIaResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo asignar cargo con IA.");
    } finally {
      setIaLoading(false);
    }
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
    <form className="modal-form" onSubmit={handleSubmit}>
      <p className="section-description">
        Registra la información personal, campamento, cargo y estado de la
        persona.
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="modal-form__section">
        <h3 className="modal-form__section-title">Datos personales</h3>

        <div className="modal-form__row">
          <label className="form-field">
            <span>Cédula *</span>
            <input
              value={form.cedula}
              onChange={(event) => handleChange("cedula", event.target.value)}
              autoFocus
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
        </div>

        <div className="modal-form__row">
          <label className="form-field">
            <span>Nombre *</span>
            <input
              value={form.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Apellidos *</span>
            <input
              value={form.apellidos}
              onChange={(event) =>
                handleChange("apellidos", event.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div className="modal-form__section">
        <h3 className="modal-form__section-title">Asignación</h3>

        {!idCampamentoFijo && (
          <label className="form-field">
            <span>Campamento *</span>
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
        )}

        <div className="modal-form__row">
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
            <span>Estado *</span>
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
        </div>

        <label className="form-field">
          <span>Código campamento</span>
          <input
            value={form.codigo_campamento}
            onChange={(event) =>
              handleChange("codigo_campamento", event.target.value)
            }
            placeholder="Identificador interno del campamento"
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleAsignarCargoIA}
            disabled={iaLoading}
          >
            {iaLoading ? "Consultando IA..." : "Asignar cargo con IA"}
          </button>

          {iaResult && (
            <div style={{ marginTop: 10, padding: 10, border: "1px solid var(--section-border)", borderRadius: 6, background: "rgba(0,0,0,0.15)" }}>
              <p style={{ fontSize: 13, margin: "0 0 4px" }}><strong>Recomendación IA:</strong> {iaResult.reason}</p>
              <p style={{ fontSize: 12, margin: 0, color: "var(--section-muted)" }}>
                Cargo sugerido: {iaResult.recommendedCargoName}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="modal-form__section">
        <h3 className="modal-form__section-title">Medios (opcional)</h3>

        <label className="form-field">
          <span>Foto URL</span>
          <input
            value={form.foto_url}
            onChange={(event) => handleChange("foto_url", event.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className="form-field">
          <span>Imagen carnet URL</span>
          <input
            value={form.imagen_carnet_url}
            onChange={(event) =>
              handleChange("imagen_carnet_url", event.target.value)
            }
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="modal-form__actions">
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
      </div>
    </form>
  );
}

export default PersonaForm;
