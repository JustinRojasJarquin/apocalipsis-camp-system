export interface RecursoSolicitudDTO {
  id_recurso: number;
  cantidad_pedida: number;
}

export interface PersonaSolicitudDTO {
  id_cargo: number;
  cantidad_personas: number;
}

export interface CreateSolicitudDTO {
  id_campamento_origen: number;
  id_campamento_destino: number;
  tipo: "RECURSOS" | "PERSONAS" | "MIXTA";
  motivo?: string;
  recursos?: RecursoSolicitudDTO[];
  personas?: PersonaSolicitudDTO[];
}

export interface RecursoAprobadoDTO {
  id_solicitud_rec: number;
  cantidad_aprobada: number;
}

export interface ResponderSolicitudDTO {
  estado: "APROBADA" | "RECHAZADA" | "AJUSTADA";
  respuesta?: string;
  recursos_aprobados?: RecursoAprobadoDTO[];
  fecha_salida_programada?: string;
  fecha_llegada_programada?: string;
  raciones_viaje?: number;
}
