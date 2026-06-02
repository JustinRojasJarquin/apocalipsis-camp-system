export interface EstadoFisico {
  id_estado_fisico: number;

  nombre: string;

  descripcion?: string;

  disponible: boolean;

  nivel_riesgo: number;
}

export interface CambiarEstadoFisicoPayload {
  idPersona: number;

  idEstadoFisico: number;

  observacion?: string;
}

export interface EstadoFisicoResponse {
  ok: boolean;

  data: {
    riesgo: number;

    explicacionIA: string;

    persona: unknown;
  };
}