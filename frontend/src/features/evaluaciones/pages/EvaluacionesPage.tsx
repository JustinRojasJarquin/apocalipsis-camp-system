import { useEffect, useMemo, useState } from "react";
import { Check, PlusCircle, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import { PageModal } from "../../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
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
  const [selectedPersonaId, setSelectedPersonaId] =
    useState<number>(initialPersonaId);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [decisionForms, setDecisionForms] = useState<
    Record<number, DecisionFormState>
  >({});
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(
    Boolean(initialPersonaId),
  );

  const selectedPersona = useMemo(
    () => personas.find((persona) => persona.id_persona === selectedPersonaId),
    [personas, selectedPersonaId],
  );

  const pendientes = evaluaciones.filter((item) => !item.decision_final).length;

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
    void loadData();
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
      setMostrarFormulario(false);
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

  const handleSubmitDecision = async (
    evaluacion: EvaluacionIngreso,
    decisionOverride?: "ACEPTADO" | "RECHAZADO",
  ) => {
    const state = decisionForms[evaluacion.id_evaluacion];
    if (!state) {
      return;
    }

    const decision = decisionOverride ?? state.decision_final;

    setDecisionForms((current) => ({
      ...current,
      [evaluacion.id_evaluacion]: { ...state, loading: true, error: null },
    }));

    try {
      await updateEvaluacionDecision(evaluacion.id_evaluacion, {
        decision_final: decision,
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

  const renderDecisionBadge = (evaluacion: EvaluacionIngreso) => {
    if (!evaluacion.decision_final) {
      return <span className="status-badge status-pending">Pendiente</span>;
    }

    if (evaluacion.decision_final === "ACEPTADO") {
      return <span className="status-badge status-active">Aceptado</span>;
    }

    return <span className="status-badge status-inactive">Rechazado</span>;
  };

  return (
    <div style={{ display: "flex", background: "#09110f", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Evaluaciones</span>
              <h1>Evaluación de ingreso</h1>
              <p className="page-description">
                Gestiona recomendaciones de IA y registra la decisión final por
                persona, con un flujo claro entre creación e historial.
              </p>
            </div>

            <div className="page-header-actions">
              <div className="campamentos-stat">
                <span className="stat-label">Pendientes</span>
                <strong className="stat-value">{pendientes}</strong>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => setMostrarFormulario(true)}
              >
                + Nueva evaluación
              </button>
            </div>
          </section>

          {globalError && <div className="error-box">{globalError}</div>}

          <section className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Historial de evaluaciones</h3>
                  <p className="small-text">
                    Revisa recomendaciones IA, motivos y registra la decisión
                    final cuando corresponda.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Cargando evaluaciones...</div>
              ) : evaluaciones.length === 0 ? (
                <div className="empty-state">
                  No hay evaluaciones registradas. Crea una con el botón
                  &quot;Nueva evaluación&quot;.
                </div>
              ) : (
                evaluaciones.map((evaluacion) => {
                  const formState = decisionForms[evaluacion.id_evaluacion];

                  return (
                    <article
                      key={evaluacion.id_evaluacion}
                      className="evaluacion-card"
                    >
                      <div className="evaluacion-card__header">
                        <div>
                          <h4>
                            {evaluacion.persona?.nombre}{" "}
                            {evaluacion.persona?.apellidos}
                          </h4>
                          <p className="small-text">
                            {evaluacion.campamento?.nombre ?? "Sin campamento"}
                          </p>
                        </div>
                        {renderDecisionBadge(evaluacion)}
                      </div>

                      <div className="evaluacion-meta-grid">
                        <div className="evaluacion-meta-item">
                          <span>Recomendación IA</span>
                          <strong>{evaluacion.recomendacion_ia}</strong>
                        </div>

                        <div className="evaluacion-meta-item">
                          <span>Motivo IA</span>
                          <p>{evaluacion.motivo_ia || "Sin motivo registrado"}</p>
                        </div>

                        <div className="evaluacion-meta-item">
                          <span>Fecha evaluación</span>
                          <strong>{formatDate(evaluacion.fecha_evaluacion)}</strong>
                        </div>

                        <div className="evaluacion-meta-item">
                          <span>Decisión / comentarios</span>
                          <p>
                            {evaluacion.decision_final
                              ? `${evaluacion.decision_final}. ${evaluacion.comentarios || "Sin comentarios"}`
                              : "Pendiente de decisión humana"}
                          </p>
                        </div>
                      </div>

                      {!evaluacion.decision_final && (
                        <div className="decision-form-row">
                          <label className="form-field">
                            <span>Decisión final</span>
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
                              <option value="ACEPTADO">Aceptar ingreso</option>
                              <option value="RECHAZADO">Rechazar ingreso</option>
                            </select>
                          </label>

                          <label className="form-field">
                            <span>Comentarios</span>
                            <textarea
                              placeholder="Observaciones opcionales sobre la decisión"
                              value={formState?.comentarios ?? ""}
                              onChange={(event) =>
                                handleDecisionChange(
                                  evaluacion.id_evaluacion,
                                  "comentarios",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          {formState?.error && (
                            <div className="error-box">{formState.error}</div>
                          )}

                          <div className="decision-form-actions">
                            <CrudActions layout="inline">
                              <CrudActionGroup>
                                <CrudAction
                                  label={
                                    formState?.loading
                                      ? "Registrando..."
                                      : "Registrar aceptación"
                                  }
                                  icon={Check}
                                  variant="success"
                                  disabled={formState?.loading}
                                  loading={formState?.loading}
                                  onClick={() =>
                                    void handleSubmitDecision(
                                      evaluacion,
                                      "ACEPTADO",
                                    )
                                  }
                                />
                                <CrudAction
                                  label={
                                    formState?.loading
                                      ? "Registrando..."
                                      : "Registrar rechazo"
                                  }
                                  icon={X}
                                  variant="danger"
                                  disabled={formState?.loading}
                                  loading={formState?.loading}
                                  onClick={() =>
                                    void handleSubmitDecision(
                                      evaluacion,
                                      "RECHAZADO",
                                    )
                                  }
                                />
                              </CrudActionGroup>
                            </CrudActions>
                          </div>
                        </div>
                      )}

                      {evaluacion.decision_final && (
                        <div className="decision-form-actions">
                          <span className="status-badge status-active">
                            Decisión registrada el{" "}
                            {formatDate(evaluacion.fecha_decision)}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
          </section>

          {mostrarFormulario && (
            <PageModal
              title="Nueva evaluación"
              onClose={() => {
                setMostrarFormulario(false);
                setCreateError(null);
              }}
              size="md"
            >
              <div className="modal-form">
                <p className="section-description">
                  El sistema generará una recomendación IA y registrará la
                  evaluación para la persona seleccionada.
                </p>

                <div className="modal-form__section">
                  <h3 className="modal-form__section-title">Persona a evaluar</h3>

                  <label className="form-field">
                    <span>Persona *</span>
                    <select
                      id="persona-select"
                      value={selectedPersonaId}
                      onChange={(event) =>
                        setSelectedPersonaId(Number(event.target.value))
                      }
                    >
                      <option value={0}>Selecciona una persona</option>
                      {personas.map((persona) => (
                        <option key={persona.id_persona} value={persona.id_persona}>
                          {persona.nombre} {persona.apellidos} -{" "}
                          {persona.campamento?.nombre ||
                            `Campamento #${persona.id_campamento}`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {createError && <div className="error-box">{createError}</div>}

                <div className="modal-form__actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setCreateError(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <CrudActions layout="inline">
                    <CrudActionGroup>
                      <CrudAction
                        label={
                          creating ? "Creando evaluación..." : "Crear evaluación"
                        }
                        icon={PlusCircle}
                        variant="primary"
                        disabled={creating || !selectedPersonaId}
                        loading={creating}
                        onClick={() => void handleCreateEvaluacion()}
                      />
                    </CrudActionGroup>
                  </CrudActions>
                </div>
              </div>
            </PageModal>
          )}
        </main>
      </div>
    </div>
  );
}
