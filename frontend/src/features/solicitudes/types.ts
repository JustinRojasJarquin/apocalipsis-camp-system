export type SolicitudEstado = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "AJUSTADA";
export type SolicitudTipo = "RECURSOS" | "PERSONAS" | "MIXTA";

export type SolicitudCampamento = {
  id_solicitud: number;
  id_campamento_origen: number;
  id_campamento_destino: number;
  tipo: SolicitudTipo;
  estado: SolicitudEstado;
  motivo?: string | null;
  respuesta?: string | null;
  solicitud_recurso?: Array<{
    id_solicitud_rec: number;
    id_recurso: number;
    cantidad_pedida: number;
    cantidad_aprobada?: number | null;
    recurso?: { nombre: string; unidad?: string };
  }>;
  solicitud_persona?: Array<{
    id_solicitud_per: number;
    id_cargo: number;
    cantidad_personas: number;
    cargo?: { nombre: string };
  }>;
  envio?: Array<{
    id_envio: number;
    estado: "PENDIENTE" | "EN_TRANSITO" | "COMPLETADO" | "CANCELADO";
    envio_persona?: Array<{
      id_envio_persona: number;
      persona?: { nombre: string; apellidos: string };
      raciones_viaje: number;
    }>;
    envio_recurso?: Array<{
      id_envio_recurso: number;
      cantidad_enviada: number;
      cantidad_recibida?: number | null;
      recurso?: { nombre: string; unidad?: string };
    }>;
  }>;
};
