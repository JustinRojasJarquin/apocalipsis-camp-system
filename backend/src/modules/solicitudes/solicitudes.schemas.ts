import { CreateSolicitudDTO, ResponderSolicitudDTO } from "./solicitudes.dto";

const TIPOS_VALIDOS = ["RECURSOS", "PERSONAS", "MIXTA"] as const;
const ESTADOS_RESPUESTA = ["APROBADA", "RECHAZADA", "AJUSTADA"] as const;

export const validateCrearSolicitud = (data: CreateSolicitudDTO): void => {
  if (!Number.isInteger(data.id_campamento_origen) || data.id_campamento_origen <= 0)
    throw new Error("id_campamento_origen debe ser un entero positivo");

  if (!Number.isInteger(data.id_campamento_destino) || data.id_campamento_destino <= 0)
    throw new Error("id_campamento_destino debe ser un entero positivo");

  if (data.id_campamento_origen === data.id_campamento_destino)
    throw new Error("El campamento origen y destino no pueden ser iguales");

  if (!TIPOS_VALIDOS.includes(data.tipo as any))
    throw new Error(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(", ")}`);

  if (data.motivo !== undefined && typeof data.motivo !== "string")
    throw new Error("motivo debe ser texto");

  if (data.tipo === "RECURSOS" || data.tipo === "MIXTA") {
    if (!data.recursos || data.recursos.length === 0)
      throw new Error("Debe incluir al menos un recurso para tipo RECURSOS o MIXTA");

    for (const r of data.recursos) {
      if (!Number.isInteger(r.id_recurso) || r.id_recurso <= 0)
        throw new Error("id_recurso debe ser un entero positivo");
      if (typeof r.cantidad_pedida !== "number" || r.cantidad_pedida <= 0)
        throw new Error("cantidad_pedida debe ser mayor a 0");
    }
  }

  if (data.tipo === "PERSONAS" || data.tipo === "MIXTA") {
    if (!data.personas || data.personas.length === 0)
      throw new Error("Debe incluir al menos un cargo para tipo PERSONAS o MIXTA");

    for (const p of data.personas) {
      if (!Number.isInteger(p.id_cargo) || p.id_cargo <= 0)
        throw new Error("id_cargo debe ser un entero positivo");
      if (!Number.isInteger(p.cantidad_personas) || p.cantidad_personas <= 0)
        throw new Error("cantidad_personas debe ser un entero positivo");
    }
  }
};

export const validateResponderSolicitud = (data: ResponderSolicitudDTO): void => {
  if (!ESTADOS_RESPUESTA.includes(data.estado as any))
    throw new Error(`estado debe ser uno de: ${ESTADOS_RESPUESTA.join(", ")}`);

  if (data.respuesta !== undefined && typeof data.respuesta !== "string")
    throw new Error("respuesta debe ser texto");

  if (data.estado === "APROBADA" || data.estado === "AJUSTADA") {
    if (!data.fecha_salida_programada || !data.fecha_llegada_programada)
      throw new Error("Se requieren fecha_salida_programada y fecha_llegada_programada al aprobar");

    const salida = new Date(data.fecha_salida_programada);
    const llegada = new Date(data.fecha_llegada_programada);

    if (isNaN(salida.getTime())) throw new Error("fecha_salida_programada inválida");
    if (isNaN(llegada.getTime())) throw new Error("fecha_llegada_programada inválida");
    if (llegada <= salida) throw new Error("fecha_llegada_programada debe ser posterior a fecha_salida_programada");

    if (data.recursos_aprobados) {
      for (const r of data.recursos_aprobados) {
        if (!Number.isInteger(r.id_solicitud_rec) || r.id_solicitud_rec <= 0)
          throw new Error("id_solicitud_rec debe ser un entero positivo");
        if (typeof r.cantidad_aprobada !== "number" || r.cantidad_aprobada < 0)
          throw new Error("cantidad_aprobada debe ser mayor o igual a 0");
      }
    }

    if (data.raciones_viaje !== undefined && (typeof data.raciones_viaje !== "number" || data.raciones_viaje < 0))
      throw new Error("raciones_viaje debe ser un número mayor o igual a 0");
  }
};
