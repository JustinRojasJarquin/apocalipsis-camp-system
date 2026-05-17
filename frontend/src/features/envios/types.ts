export type EnvioEstado = "PENDIENTE" | "EN_TRANSITO" | "COMPLETADO" | "CANCELADO";

export type Envio = {
  id_envio: number;
  id_solicitud: number;
  id_campamento_origen: number;
  id_campamento_destino: number;
  fecha_salida_programada: string;
  fecha_llegada_programada: string;
  fecha_salida_aprobada?: string | null;
  fecha_llegada_aprobada?: string | null;
  estado: EnvioEstado;
  campamento_envio_id_campamento_origenTocampamento?: { nombre: string };
  campamento_envio_id_campamento_destinoTocampamento?: { nombre: string };
  envio_recurso?: Array<{
    id_envio_recurso: number;
    cantidad_enviada: number;
    cantidad_recibida?: number | null;
    recurso?: { nombre: string; unidad: string };
  }>;
  envio_persona?: Array<{
    id_envio_persona: number;
    raciones_viaje: number;
    persona?: { nombre: string; apellidos: string };
  }>;
};
