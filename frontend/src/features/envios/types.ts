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
    id_recurso?: number;
    cantidad_enviada: number;
    cantidad_recibida?: number | null;
    recurso?: { nombre: string; unidad: string };
  }>;
  envio_persona?: Array<{
    id_envio_persona: number;
    id_persona?: number;
    raciones_viaje: number;
    persona?: {
      nombre: string;
      apellidos: string;
      estado_persona?: { nombre: string; disponible: boolean } | null;
    };
  }>;
  historial?: {
    bitacora?: Array<{
      id_bitacora: number;
      tipo_accion: string;
      descripcion?: string | null;
      fecha_hora: string;
    }>;
    movimientos_inventario?: Array<{
      id_movimiento: number;
      tipo: string;
      cantidad: number;
      fecha_hora: string;
      recurso?: { nombre: string; unidad?: string };
      campamento?: { nombre: string };
    }>;
    asignaciones_personas?: Array<{
      id_asignacion: number;
      id_persona: number;
      fecha_inicio: string;
      fecha_fin?: string | null;
      cargo?: { nombre: string };
      campamento?: { nombre: string };
    }>;
  };
};

export type EnvioPayload = {
  id_solicitud: number;
  id_campamento_origen: number;
  id_campamento_destino: number;
  fecha_salida_programada: string;
  fecha_llegada_programada: string;
  recursos?: Array<{ id_recurso: number; cantidad_enviada: number }>;
  personas?: Array<{ id_persona: number; raciones_viaje?: number }>;
};

export type UpdateEnvioPayload = Partial<
  Pick<EnvioPayload, "fecha_salida_programada" | "fecha_llegada_programada" | "recursos" | "personas">
>;
