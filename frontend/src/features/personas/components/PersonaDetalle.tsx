import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assignCargoByIA } from "../personas.api";
import type { CargoIARecommendation, Persona } from "../types";

interface Props {
  persona: Persona | null;
  onClose: () => void;
  onCargoAssigned?: (persona: Persona) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";

  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) return "Sin fecha";

  const [, year, month, day] = match;
  return `${Number(day)}/${Number(month)}/${year}`;
};

export default function PersonaDetalle({ persona, onClose, onCargoAssigned }: Props) {
  const navigate = useNavigate();
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);
  const [iaResult, setIaResult] = useState<CargoIARecommendation | null>(null);

  if (!persona) return null;

  const historial = persona.asignacion_cargo ?? [];

  const handleAssignCargoIA = async () => {
    if (!persona.id_persona) return;

    setIaLoading(true);
    setIaError(null);
    setIaResult(null);

    try {
      const result = await assignCargoByIA(persona.id_persona);
      setIaResult(result);
      onCargoAssigned?.(result.persona);
    } catch (error) {
      setIaError(
        error instanceof Error
          ? error.message
          : "No se pudo asignar cargo con IA.",
      );
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div className="personas-modal-backdrop" role="dialog" aria-modal="true">
      <section className="personas-modal">
        <div className="card-header">
          <div>
            <span className="page-badge">Detalle de persona</span>
            <h3>
              {persona.nombre} {persona.apellidos}
            </h3>
            <p className="small-text">Cedula: {persona.cedula}</p>
          </div>

          <button type="button" className="button button-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="persona-detail-grid">
          <div className="campamento-mini-card">
            <span>Campamento</span>
            <strong>{persona.campamento?.nombre ?? `#${persona.id_campamento}`}</strong>
          </div>
          <div className="campamento-mini-card">
            <span>Cargo actual</span>
            <strong>{persona.cargo?.nombre ?? "Sin cargo"}</strong>
          </div>
          <div className="campamento-mini-card">
            <span>Estado</span>
            <strong>{persona.estado_persona?.nombre ?? "Sin estado"}</strong>
          </div>
          <div className="campamento-mini-card">
            <span>Nacimiento</span>
            <strong>{formatDate(persona.fecha_nacimiento)}</strong>
          </div>
          <div className="campamento-mini-card">
            <span>Codigo</span>
            <strong>{persona.codigo_campamento?.trim() || "Sin codigo"}</strong>
          </div>
        </div>

        <section className="campamento-detail-section">
          <div className="detail-section-title">
            <h4>IA para asignar cargo</h4>
<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button button-primary"
              onClick={handleAssignCargoIA}
              disabled={iaLoading}
            >
              {iaLoading ? "Consultando IA..." : "Asignar cargo con IA"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate(`/evaluaciones?persona=${persona.id_persona}`)}
            >
              Evaluación de ingreso
            </button>
          </div>
          </div>

          {iaError && <div className="error-box">{iaError}</div>}

          {iaResult && (
            <div className="ia-result-card">
              <p>
                <strong>Cargo recomendado:</strong> {iaResult.recommendedCargoName}
              </p>
              <p>
                <strong>Motivo:</strong> {iaResult.reason}
              </p>
              <p>
                <strong>Resultado:</strong>{" "}
                {iaResult.changed
                  ? "Cargo actualizado con la recomendación IA."
                  : "El cargo actual no cambió."}
              </p>
            </div>
          )}
        </section>

        <section className="campamento-detail-section">
          <div className="detail-section-title">
            <h4>Historial de cargos</h4>
            <span>{historial.length} registros</span>
          </div>

          {historial.length === 0 ? (
            <div className="empty-state">Sin historial de cargos registrado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cargo</th>
                    <th>Campamento</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id_asignacion}>
                      <td>{item.cargo?.nombre ?? `#${item.id_cargo}`}</td>
                      <td>
                        {item.campamento?.nombre ?? `#${item.id_campamento}`}
                      </td>
                      <td>{formatDate(item.fecha_inicio)}</td>
                      <td>{item.fecha_fin ? formatDate(item.fecha_fin) : "Actual"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
