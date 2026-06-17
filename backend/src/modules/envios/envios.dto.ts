export interface ConfirmarSalidaDTO {
  fecha_salida_aprobada?: string;
}

export interface EnvioRecursoDTO {
  id_recurso: number;
  cantidad_enviada: number;
}

export interface EnvioPersonaDTO {
  id_persona: number;
  raciones_viaje?: number;
}

export interface CreateEnvioDTO {
  id_solicitud: number;
  id_campamento_origen: number;
  id_campamento_destino: number;
  fecha_salida_programada: string;
  fecha_llegada_programada: string;
  recursos?: EnvioRecursoDTO[];
  personas?: EnvioPersonaDTO[];
}

export interface UpdateEnvioDTO {
  fecha_salida_programada?: string;
  fecha_llegada_programada?: string;
  recursos?: EnvioRecursoDTO[];
  personas?: EnvioPersonaDTO[];
}

export interface RecursoRecibidoDTO {
  id_envio_recurso: number;
  cantidad_recibida: number;
}

export interface ConfirmarLlegadaDTO {
  fecha_llegada_aprobada?: string;
  recursos_recibidos?: RecursoRecibidoDTO[];
}
