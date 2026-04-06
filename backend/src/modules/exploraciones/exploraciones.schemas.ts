import type {
  CrearExploracionDto,
  ActualizarEstadoDto,
  AsignarPersonaDto,
  AgregarRecursoLlevadoDto,
  RegistrarRecursoEncontradoDto,
} from "./exploraciones.dto";

const ESTADOS_VALIDOS = [
  "PLANIFICADA",
  "EN_PROGRESO",
  "COMPLETADA",
  "CANCELADA",
  "FALLIDA",
] as const;

const ROLES_VALIDOS = ["LIDER", "EXPLORADOR"] as const;

export function validarCrearExploracion(body: any): CrearExploracionDto {
  const { id_campamento, nombre, fecha_inicio_plan, dias_estimados } = body;

  if (!id_campamento || isNaN(Number(id_campamento))) {
    throw new Error("id_campamento es requerido y debe ser un número");
  }
  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    throw new Error("nombre es requerido");
  }
  if (!fecha_inicio_plan || isNaN(Date.parse(fecha_inicio_plan))) {
    throw new Error("fecha_inicio_plan es requerida y debe ser una fecha válida (YYYY-MM-DD)");
  }
  if (!dias_estimados || isNaN(Number(dias_estimados)) || Number(dias_estimados) < 1) {
    throw new Error("dias_estimados es requerido y debe ser mayor a 0");
  }

  return {
    id_campamento: Number(id_campamento),
    nombre: nombre.trim(),
    descripcion: body.descripcion?.trim() || undefined,
    fecha_inicio_plan,
    dias_estimados: Number(dias_estimados),
    dias_extra: body.dias_extra ? Number(body.dias_extra) : 0,
  };
}

export function validarActualizarEstado(body: any): ActualizarEstadoDto {
  const { estado } = body;

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    throw new Error(
      `estado inválido. Los valores permitidos son: ${ESTADOS_VALIDOS.join(", ")}`
    );
  }

  return {
    estado,
    dias_extra_usados: body.dias_extra_usados
      ? Number(body.dias_extra_usados)
      : undefined,
  };
}

export function validarAsignarPersona(body: any): AsignarPersonaDto {
  const { id_persona, rol_en_mision } = body;

  if (!id_persona || isNaN(Number(id_persona))) {
    throw new Error("id_persona es requerido y debe ser un número");
  }
  if (rol_en_mision && !ROLES_VALIDOS.includes(rol_en_mision)) {
    throw new Error(
      `rol_en_mision inválido. Los valores permitidos son: ${ROLES_VALIDOS.join(", ")}`
    );
  }

  return {
    id_persona: Number(id_persona),
    rol_en_mision: rol_en_mision || "EXPLORADOR",
  };
}

export function validarRecursoLlevado(body: any): AgregarRecursoLlevadoDto {
  const { id_recurso, cantidad_llevada } = body;

  if (!id_recurso || isNaN(Number(id_recurso))) {
    throw new Error("id_recurso es requerido y debe ser un número");
  }
  if (
    cantidad_llevada === undefined ||
    isNaN(Number(cantidad_llevada)) ||
    Number(cantidad_llevada) <= 0
  ) {
    throw new Error("cantidad_llevada es requerida y debe ser mayor a 0");
  }

  return {
    id_recurso: Number(id_recurso),
    cantidad_llevada: Number(cantidad_llevada),
  };
}

export function validarRecursoEncontrado(
  body: any
): RegistrarRecursoEncontradoDto {
  const { id_recurso, cantidad_encontrada } = body;

  if (!id_recurso || isNaN(Number(id_recurso))) {
    throw new Error("id_recurso es requerido y debe ser un número");
  }
  if (
    cantidad_encontrada === undefined ||
    isNaN(Number(cantidad_encontrada)) ||
    Number(cantidad_encontrada) < 0
  ) {
    throw new Error("cantidad_encontrada es requerida y debe ser mayor o igual a 0");
  }

  return {
    id_recurso: Number(id_recurso),
    cantidad_encontrada: Number(cantidad_encontrada),
    generado_aleatorio: body.generado_aleatorio === true,
  };
}
