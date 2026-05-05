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
  solicitud_recurso?: any[];
  solicitud_persona?: any[];
};