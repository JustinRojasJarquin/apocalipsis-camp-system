export type EvaluacionIngresoRecomendacionIA = "ACEPTAR" | "RECHAZAR";
export type EvaluacionIngresoDecisionFinal = "ACEPTADO" | "RECHAZADO" | null;

export interface EvaluacionIngreso {
  id_evaluacion: number;
  id_persona: number;
  id_campamento: number;
  fecha_evaluacion: string;
  recomendacion_ia: EvaluacionIngresoRecomendacionIA;
  motivo_ia?: string | null;
  decision_final?: EvaluacionIngresoDecisionFinal;
  fecha_decision?: string | null;
  comentarios?: string | null;
  persona?: {
    id_persona: number;
    nombre: string;
    apellidos: string;
  };
  campamento?: {
    id_campamento: number;
    nombre: string;
  };
}

export interface CreateEvaluacionIngresoPayload {
  id_persona: number;
  id_campamento: number;
}

export interface UpdateEvaluacionDecisionPayload {
  decision_final: "ACEPTADO" | "RECHAZADO";
  comentarios?: string;
  id_usuario_decide?: number | null;
}
