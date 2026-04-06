import { prisma } from "../../config/prisma";
import type {
  CrearExploracionDto,
  ActualizarEstadoDto,
  AsignarPersonaDto,
  AgregarRecursoLlevadoDto,
  RegistrarRecursoEncontradoDto,
} from "./exploraciones.dto";

// ─── Listar exploraciones de un campamento ───────────────────────────────────

export const listarExploraciones = async (id_campamento: number) => {
  return await prisma.exploracion.findMany({
    where: { id_campamento },
    include: {
      exploracion_persona: true,
      exploracion_recurso_llevado: true,
      exploracion_recurso_encontrado: true,
    },
    orderBy: { fecha_inicio_plan: "desc" },
  });
};

// ─── Obtener una exploración con detalle completo ────────────────────────────

export const obtenerExploracion = async (id_exploracion: number) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
    include: {
      exploracion_persona: true,
      exploracion_recurso_llevado: true,
      exploracion_recurso_encontrado: true,
    },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  return exploracion;
};

// ─── Crear exploración ───────────────────────────────────────────────────────

export const crearExploracion = async (datos: CrearExploracionDto) => {
  const campamento = await prisma.campamento.findUnique({
    where: { id_campamento: datos.id_campamento },
  });

  if (!campamento) {
    throw new Error("El campamento especificado no existe");
  }

  return await prisma.exploracion.create({
    data: {
      id_campamento: datos.id_campamento,
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      fecha_inicio_plan: new Date(datos.fecha_inicio_plan),
      dias_estimados: datos.dias_estimados,
      dias_extra: datos.dias_extra ?? 0,
      estado: "PLANIFICADA",
    },
  });
};

// ─── Actualizar estado ───────────────────────────────────────────────────────

export const actualizarEstado = async (
  id_exploracion: number,
  datos: ActualizarEstadoDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  const ahora = new Date();
  const updateData: any = { estado: datos.estado };

  if (datos.estado === "EN_PROGRESO" && !exploracion.fecha_inicio_real) {
    updateData.fecha_inicio_real = ahora;
  }

  if (
    (datos.estado === "COMPLETADA" ||
      datos.estado === "CANCELADA" ||
      datos.estado === "FALLIDA") &&
    !exploracion.fecha_fin_real
  ) {
    updateData.fecha_fin_real = ahora;
  }

  if (datos.dias_extra_usados !== undefined) {
    updateData.dias_extra_usados = datos.dias_extra_usados;
  }

  return await prisma.exploracion.update({
    where: { id_exploracion },
    data: updateData,
  });
};

// ─── Asignar persona a exploración ───────────────────────────────────────────

export const asignarPersona = async (
  id_exploracion: number,
  datos: AsignarPersonaDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("Solo se pueden asignar personas a exploraciones en estado PLANIFICADA");
  }

  // TODO: Validar que la persona exista cuando el módulo de Personas esté listo
  // const persona = await prisma.persona.findUnique({ where: { id_persona: datos.id_persona } });
  // if (!persona) throw new Error("La persona no existe");

  const yaAsignada = await prisma.exploracion_persona.findUnique({
    where: {
      id_exploracion_id_persona: {
        id_exploracion,
        id_persona: datos.id_persona,
      },
    },
  });

  if (yaAsignada) {
    throw new Error("La persona ya está asignada a esta exploración");
  }

  return await prisma.exploracion_persona.create({
    data: {
      id_exploracion,
      id_persona: datos.id_persona,
      rol_en_mision: datos.rol_en_mision ?? "EXPLORADOR",
    },
  });
};

// ─── Quitar persona de exploración ───────────────────────────────────────────

export const quitarPersona = async (
  id_exploracion: number,
  id_persona: number
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("No se pueden modificar personas en una exploración que ya inició");
  }

  const asignacion = await prisma.exploracion_persona.findUnique({
    where: {
      id_exploracion_id_persona: { id_exploracion, id_persona },
    },
  });

  if (!asignacion) {
    throw new Error("La persona no está asignada a esta exploración");
  }

  return await prisma.exploracion_persona.delete({
    where: {
      id_exploracion_id_persona: { id_exploracion, id_persona },
    },
  });
};

// ─── Agregar recurso a llevar ─────────────────────────────────────────────────

export const agregarRecursoLlevado = async (
  id_exploracion: number,
  datos: AgregarRecursoLlevadoDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("Solo se pueden agregar recursos a exploraciones en estado PLANIFICADA");
  }

  // TODO: Validar stock disponible cuando el módulo de Inventario esté listo
  // const inventario = await prisma.inventario_campamento.findUnique({...});
  // if (!inventario || inventario.cantidad < datos.cantidad_llevada) throw new Error("Stock insuficiente");

  return await prisma.exploracion_recurso_llevado.create({
    data: {
      id_exploracion,
      id_recurso: datos.id_recurso,
      cantidad_llevada: datos.cantidad_llevada,
    },
  });
};

// ─── Registrar recursos encontrados al retorno ────────────────────────────────

export const registrarRecursoEncontrado = async (
  id_exploracion: number,
  datos: RegistrarRecursoEncontradoDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "EN_PROGRESO" && exploracion.estado !== "COMPLETADA") {
    throw new Error(
      "Solo se pueden registrar recursos encontrados en exploraciones EN_PROGRESO o COMPLETADAS"
    );
  }

  return await prisma.exploracion_recurso_encontrado.create({
    data: {
      id_exploracion,
      id_recurso: datos.id_recurso,
      cantidad_encontrada: datos.cantidad_encontrada,
      generado_aleatorio: datos.generado_aleatorio ?? false,
    },
  });
};
