import { useEffect, useState } from "react";
import {
  createPersona,
  getCargos,
  getEstados,
  updatePersona,
  assignCargoByIA,
} from "../personas.api";
import type {
  Persona,
  PersonaCampamento,
  PersonaCargo,
  PersonaEstado,
  PersonaFormData,
  CargoIARecommendation,
} from "../types";
import { Building2, KeyRound, Loader2 } from "lucide-react";

interface Props {
  campamentos: PersonaCampamento[];
  personaEditando: Persona | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
  campamentoPreseleccionado?: PersonaCampamento | null;
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
  campamentoPreseleccionado,
}: Props) {
  const [form, setForm] = useState<PersonaFormData>(emptyForm);
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [estados, setEstados] = useState<PersonaEstado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<CargoIARecommendation | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);

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
      // Si hay campamento preseleccionado, usarlo
      if (campamentoPreseleccionado?.id_campamento) {
        setForm((f) => ({ ...f, id_campamento: String(campamentoPreseleccionado.id_campamento) }));
      }
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

  const handleAsignarCargoIA = async () => {
    // Si estamos editando, usar el id_persona directamente
    // Si estamos creando, primero guardar la persona y luego asignar cargo
    let personaId = personaEditando?.id_persona;

    if (!personaId) {
      // Validar campos mínimos requeridos
      if (!form.cedula.trim() || !form.nombre.trim() || !form.apellidos.trim() || !form.id_campamento) {
        setIaError("Completa los datos básicos de la persona antes de usar la IA.");
        return;
      }

      // Crear la persona y asignar cargo con IA en un solo paso
      setIaLoading(true);
      setIaError(null);
      setIaResult(null);
      try {
        const nuevaPersona = await createPersona(form);
        personaId = nuevaPersona.id_persona;
        
        if (!personaId) {
          throw new Error("No se pudo obtener el ID de la persona creada.");
        }
        
        // Ahora asignar cargo con IA automáticamente
        const result = await assignCargoByIA(personaId);
        setIaResult(result);
        
        // Recargar catálogos por si cambió el cargo
        const [cargosData] = await Promise.all([getCargos()]);
        setCargos(cargosData);
        
        // Actualizar el formulario con el cargo recomendado
        if (result.changed && result.recommendedCargoId) {
          setForm((f) => ({ ...f, id_cargo_actual: String(result.recommendedCargoId) }));
        }
        
        // Notificar al componente padre para recargar datos
        onSuccess();
      } catch (err) {
        setIaError(
          err instanceof Error
            ? err.message
            : "No se pudo crear la persona o asignar cargo.",
        );
      } finally {
        setIaLoading(false);
      }
      return;
    }

    // Asignar cargo con IA a persona existente
    setIaLoading(true);
    setIaError(null);
    setIaResult(null);

    try {
      const result = await assignCargoByIA(personaId);
      setIaResult(result);
      // Recargar catálogos por si cambió el cargo
      const [cargosData] = await Promise.all([getCargos()]);
      setCargos(cargosData);
      // Actualizar el formulario con el nuevo cargo si cambió
      if (result.changed && result.recommendedCargoId) {
        setForm((f) => ({ ...f, id_cargo_actual: String(result.recommendedCargoId) }));
      }
    } catch (err) {
      setIaError(
        err instanceof Error
          ? err.message
          : "No se pudo asignar cargo con IA.",
      );
    } finally {
      setIaLoading(false);
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

        {campamentoPreseleccionado ? (
          <div style={{ padding: "14px 16px", border: "1px solid var(--admin-line)", borderRadius: 8, background: "rgba(0,0,0,0.14)" }}>
            <span style={{ color: "var(--admin-muted)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Campamento</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Building2 size={18} style={{ color: "var(--admin-accent)" }} />
              <div>
                <strong style={{ color: "var(--admin-text)", fontSize: 15 }}>{campamentoPreseleccionado.nombre}</strong>
                <span style={{ color: "var(--admin-muted)", fontSize: 12, marginLeft: 8 }}>{campamentoPreseleccionado.nombre}</span>
              </div>
            </div>
            <input type="hidden" value={campamentoPreseleccionado.id_campamento} />
          </div>
        ) : (
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
            <span>Cargo *</span>
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

        <div style={{ marginTop: 16, padding: 16, border: "1px solid var(--section-border)", borderRadius: 8, background: "rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--section-text)", fontSize: 14, fontWeight: 700 }}>Asignación de cargo con IA</span>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleAsignarCargoIA}
              disabled={iaLoading}
            >
              {iaLoading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {personaEditando?.id_persona ? "Consultando..." : "Creando..."}</> : <><KeyRound size={14} /> {personaEditando?.id_persona ? "Asignar cargo con IA" : "Crear y asignar cargo"}</>}
            </button>
          </div>

            {iaError && <div style={{ padding: 10, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, background: "rgba(239,68,68,0.06)", color: "#fca5a5", fontSize: 13, marginBottom: 12 }}>{iaError}</div>}

            {iaResult && (
              <div style={{ padding: 12, border: "1px solid rgba(56,189,248,0.3)", borderRadius: 6, background: "rgba(56,189,248,0.06)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <span style={{ color: "var(--section-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cargo recomendado</span>
                    <p style={{ color: "#9fef00", fontSize: 14, fontWeight: 700, margin: "2px 0 0" }}>{iaResult.recommendedCargoName}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--section-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resultado</span>
                    <p style={{ color: iaResult.changed ? "#9fef00" : "#f6c453", fontSize: 13, fontWeight: 700, margin: "2px 0 0" }}>{iaResult.changed ? "Cargo actualizado" : "Sin cambios"}</p>
                  </div>
                </div>
                <p style={{ color: "var(--section-muted)", fontSize: 12, margin: 0 }}><strong>Motivo:</strong> {iaResult.reason}</p>
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
