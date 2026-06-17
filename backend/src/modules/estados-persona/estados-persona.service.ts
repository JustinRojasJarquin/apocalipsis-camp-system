import { prisma } from "../../config/prisma";
import type {
  CreateEstadoPersonaDTO,
  UpdateEstadoPersonaDTO,
} from "./estados-persona.dto";
import {
  validateCreateEstadoPersona,
  validateUpdateEstadoPersona,
} from "./estados-persona.schemas";

const ensurePositiveId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID invalido");
  }
};

const normalizeEstadoData = (
  data: CreateEstadoPersonaDTO | UpdateEstadoPersonaDTO,
) => ({
  ...("nombre" in data && data.nombre !== undefined
    ? { nombre: data.nombre.trim() }
    : {}),
  ...("descripcion" in data
    ? { descripcion: data.descripcion?.trim() || null }
    : {}),
  ...("disponible" in data && data.disponible !== undefined
    ? { disponible: data.disponible }
    : {}),
});

const ensureEstadoExists = async (id_estado: number) => {
  const estado = await prisma.estado_persona.findUnique({
    where: { id_estado },
    select: { id_estado: true },
  });

  if (!estado) {
    throw new Error("El estado no existe");
  }
};

const ensureNombreDisponible = async (nombre: string, id_estado?: number) => {
  const estado = await prisma.estado_persona.findFirst({
    where: {
      nombre: nombre.trim(),
      ...(id_estado ? { NOT: { id_estado } } : {}),
    },
    select: { id_estado: true },
  });

  if (estado) {
    throw new Error("Ya existe un estado con ese nombre");
  }
};

export const getEstadosPersona = async () => {
  return prisma.estado_persona.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const createEstadoPersona = async (data: CreateEstadoPersonaDTO) => {
  validateCreateEstadoPersona(data);
  await ensureNombreDisponible(data.nombre);

  return prisma.estado_persona.create({
    data: {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      disponible: data.disponible ?? true,
    },
  });
};

export const updateEstadoPersona = async (
  id: number,
  data: UpdateEstadoPersonaDTO,
) => {
  ensurePositiveId(id);
  validateUpdateEstadoPersona(data);
  await ensureEstadoExists(id);

  if (data.nombre !== undefined) {
    await ensureNombreDisponible(data.nombre, id);
  }

  return prisma.estado_persona.update({
    where: { id_estado: id },
    data: normalizeEstadoData(data),
  });
};

export const deleteEstadoPersona = async (id: number) => {
  ensurePositiveId(id);
  await ensureEstadoExists(id);

  const personasAsignadas = await prisma.persona.count({
    where: { id_estado_actual: id, activo: true },
  });

  if (personasAsignadas > 0) {
    throw new Error(
      "No se puede eliminar un estado con personas activas asignadas",
    );
  }

  return prisma.estado_persona.delete({
    where: { id_estado: id },
  });
};
