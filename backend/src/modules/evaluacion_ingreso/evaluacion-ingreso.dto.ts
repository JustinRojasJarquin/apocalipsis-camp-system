export interface CreateEvaluacionIngresoDTO {
  id_persona: number;
  id_campamento: number;
}

export interface UpdateEvaluacionDecisionDTO {
  decision_final: "ACEPTADO" | "RECHAZADO";
  comentarios?: string | null;
  id_usuario_decide?: number | null;
}

export interface EvaluacionIngresoResponseDTO {
  id_evaluacion: number;
  id_persona: number;
  id_campamento: number;
  fecha_evaluacion: Date | string;
  recomendacion_ia: string;
  motivo_ia: string | null;
  decision_final: string | null;
  fecha_decision: Date | string | null;
  comentarios: string | null;
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
