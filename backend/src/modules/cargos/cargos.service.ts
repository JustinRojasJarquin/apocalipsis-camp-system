import { prisma } from "../../config/prisma";
import type { CreateCargoDTO, UpdateCargoDTO } from "./cargos.dto";
import { validateCreateCargo, validateUpdateCargo } from "./cargos.schemas";

const ensurePositiveId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID invalido");
  }
};

const normalizeCargoData = (data: CreateCargoDTO | UpdateCargoDTO) => ({
  ...("nombre" in data && data.nombre !== undefined
    ? { nombre: data.nombre.trim() }
    : {}),
  ...("descripcion" in data
    ? { descripcion: data.descripcion?.trim() || null }
    : {}),
});

const ensureCargoExists = async (id_cargo: number) => {
  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo },
    select: { id_cargo: true },
  });

  if (!cargo) {
    throw new Error("El cargo no existe");
  }
};

const ensureNombreDisponible = async (nombre: string, id_cargo?: number) => {
  const cargo = await prisma.cargo.findFirst({
    where: {
      nombre: nombre.trim(),
      ...(id_cargo ? { NOT: { id_cargo } } : {}),
    },
    select: { id_cargo: true },
  });

  if (cargo) {
    throw new Error("Ya existe un cargo con ese nombre");
  }
};

export const getCargos = async () => {
  return prisma.cargo.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const getCargoById = async (id: number) => {
  ensurePositiveId(id);

  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo: id },
  });

  if (!cargo) {
    throw new Error("El cargo no existe");
  }

  return cargo;
};

export const createCargo = async (data: CreateCargoDTO) => {
  validateCreateCargo(data);
  await ensureNombreDisponible(data.nombre);

  return prisma.cargo.create({
    data: {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
    },
  });
};

export const updateCargo = async (id: number, data: UpdateCargoDTO) => {
  ensurePositiveId(id);
  validateUpdateCargo(data);
  await ensureCargoExists(id);

  if (data.nombre !== undefined) {
    await ensureNombreDisponible(data.nombre, id);
  }

  return prisma.cargo.update({
    where: { id_cargo: id },
    data: normalizeCargoData(data),
  });
};

export const deleteCargo = async (id: number) => {
  ensurePositiveId(id);
  await ensureCargoExists(id);

  const personasAsignadas = await prisma.persona.count({
    where: { id_cargo_actual: id, activo: true },
  });

  if (personasAsignadas > 0) {
    throw new Error(
      "No se puede eliminar un cargo con personas activas asignadas",
    );
  }

  return prisma.cargo.delete({
    where: { id_cargo: id },
  });
};
