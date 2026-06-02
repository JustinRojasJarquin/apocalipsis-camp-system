import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPersonas } from "../../personas/personas.api";
import type { Persona } from "../../personas/types";
import {
  createEvaluacionIngreso,
  getEvaluaciones,
  updateEvaluacionDecision,
} from "../evaluaciones.api";
import type { EvaluacionIngreso } from "../types";

interface DecisionFormState {
  decision_final: "ACEPTADO" | "RECHAZADO";
  comentarios: string;
  loading: boolean;
  error: string | null;
}

export default function EvaluacionesPage() {
  const [searchParams] = useSearchParams();
  const initialPersonaId = Number(searchParams.get("persona")) || 0;

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionIngreso[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<number>(initialPersonaId);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [decisionForms, setDecisionForms] = useState<Record<number, DecisionFormState>>({});
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const selectedPersona = useMemo(
    () => personas.find((persona) => persona.id_persona === selectedPersonaId),
    [personas, selectedPersonaId],
  );

  const loadData = async () => {
    setGlobalError(null);
    setLoading(true);

    try {
      const [personasData, evaluacionesData] = await Promise.all([
        getPersonas(),
        getEvaluaciones(),
      ]);

      setPersonas(personasData);
      setEvaluaciones(evaluacionesData);

      const initialFormState: Record<number, DecisionFormState> = {};
      evaluacionesData.forEach((evaluacion) => {
        initialFormState[evaluacion.id_evaluacion] = {
          decision_final: "ACEPTADO",
          comentarios: evaluacion.comentarios ?? "",
          loading: false,
          error: null,
        };
      });

      setDecisionForms(initialFormState);
    } catch (error) {
      setGlobalError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvaluacion = async () => {
    if (!selectedPersona) {
      setCreateError("Selecciona una persona para crear la evaluación.");
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const personaId = selectedPersona.id_persona ?? 0;

      await createEvaluacionIngreso({
        id_persona: personaId,
        id_campamento: selectedPersona.id_campamento,
      });
      await loadData();
      setSelectedPersonaId(personaId);
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la evaluación",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDecisionChange = (
    id_evaluacion: number,
    field: keyof Omit<DecisionFormState, "loading" | "error">,
    value: string,
  ) => {
    setDecisionForms((current) => ({
      ...current,
      [id_evaluacion]: {
        ...current[id_evaluacion],
        [field]: value,
      },
    }));
  };

  const handleSubmitDecision = async (evaluacion: EvaluacionIngreso) => {
    const state = decisionForms[evaluacion.id_evaluacion];
    if (!state) {
      return;
    }

    setDecisionForms((current) => ({
      ...current,
      [evaluacion.id_evaluacion]: { ...state, loading: true, error: null },
    }));

    try {
      await updateEvaluacionDecision(evaluacion.id_evaluacion, {
        decision_final: state.decision_final,
        comentarios: state.comentarios,
      });
      await loadData();
    } catch (error) {
      setDecisionForms((current) => ({
        ...current,
        [evaluacion.id_evaluacion]: {
          ...state,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "No se pudo actualizar la decisión.",
        },
      }));
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Sin fecha";

    const datePart = value.slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!match) return "Sin fecha";

    const [, year, month, day] = match;
    return `${Number(day)}/${Number(month)}/${year}`;
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <span className="page-badge">Evaluaciones</span>
        <h2>Evaluación de ingreso</h2>
        <p>Gestiona recomendaciones de IA y registra la decisión final.</p>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Crear nueva evaluación</h3>
            <p className="small-text">
              El sistema generará una recomendación IA y registrará la evaluación.
            </p>
          </div>
        </div>

        <div className="card-body">
          <div className="field-group">
            <label htmlFor="persona-select">Persona</label>
            <select
              id="persona-select"
              value={selectedPersonaId}
              onChange={(event) => setSelectedPersonaId(Number(event.target.value))}
            >
              <option value={0}>Selecciona una persona</option>
              {personas.map((persona) => (
                <option key={persona.id_persona} value={persona.id_persona}>
                  {persona.nombre} {persona.apellidos} - {persona.campamento?.nombre || `Campamento #${persona.id_campamento}`}
                </option>
              ))}
            </select>
          </div>

          {createError && <div className="error-box">{createError}</div>}

          <button
            className="button button-primary"
            type="button"
            onClick={handleCreateEvaluacion}
            disabled={creating}
          >
            {creating ? "Creando evaluación..." : "Crear evaluación de ingreso"}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Historial de evaluaciones</h3>
            <p className="small-text">
              Revisa las recomendaciones IA, su motivo y registra la decisión final.
            </p>
          </div>
        </div>

        <div className="card-body">
          {globalError && <div className="error-box">{globalError}</div>}

          {loading ? (
            <div>Cargando evaluaciones...</div>
          ) : evaluaciones.length === 0 ? (
            <div className="empty-state">No hay evaluaciones registradas.</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Campamento</th>
                    <th>Recomendación IA</th>
                    <th>Motivo IA</th>
                    <th>Decisión final</th>
                    <th>Comentarios</th>
                    <th>Fechas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((evaluacion) => {
                    const formState = decisionForms[evaluacion.id_evaluacion];
                    const decisionLabel = evaluacion.decision_final || "Pendiente";

                    return (
                      <tr key={evaluacion.id_evaluacion}>
                        <td>
                          {evaluacion.persona?.nombre} {evaluacion.persona?.apellidos}
                        </td>
                        <td>{evaluacion.campamento?.nombre}</td>
                        <td>{evaluacion.recomendacion_ia}</td>
                        <td>{evaluacion.motivo_ia || "Sin motivo"}</td>
                        <td>{decisionLabel}</td>
                        <td>{evaluacion.comentarios || "Sin comentarios"}</td>
                        <td>
                          <div>{formatDate(evaluacion.fecha_evaluacion)}</div>
                          <div>{evaluacion.fecha_decision ? formatDate(evaluacion.fecha_decision) : "Sin decisión"}</div>
                        </td>
                        <td>
                          {evaluacion.decision_final ? (
                            <span className="badge badge-success">Decisión registrada</span>
                          ) : (
                            <div className="decision-form-row">
                              <select
                                value={formState?.decision_final ?? "ACEPTADO"}
                                onChange={(event) =>
                                  handleDecisionChange(
                                    evaluacion.id_evaluacion,
                                    "decision_final",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="ACEPTADO">ACEPTAR</option>
                                <option value="RECHAZADO">RECHAZAR</option>
                              </select>
                              <textarea
                                placeholder="Comentarios (opcional)"
                                value={formState?.comentarios ?? ""}
                                onChange={(event) =>
                                  handleDecisionChange(
                                    evaluacion.id_evaluacion,
                                    "comentarios",
                                    event.target.value,
                                  )
                                }
                              />
                              {formState?.error && (
                                <div className="error-box">{formState.error}</div>
                              )}
                              <button
                                className="button button-primary"
                                type="button"
                                onClick={() => handleSubmitDecision(evaluacion)}
                                disabled={formState?.loading}
                              >
                                {formState?.loading ? "Registrando..." : "Registrar decisión"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
