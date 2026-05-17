export interface ConfirmarSalidaDTO {
  fecha_salida_aprobada?: string;
}

export interface RecursoRecibidoDTO {
  id_envio_recurso: number;
  cantidad_recibida: number;
}

export interface ConfirmarLlegadaDTO {
  fecha_llegada_aprobada?: string;
  recursos_recibidos?: RecursoRecibidoDTO[];
}
