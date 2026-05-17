import { prisma } from "../../config/prisma";
import { validateRecurso, validateUpdateRecurso } from "./recursos.schemas";
import type { CreateRecursoDTO, UpdateRecursoDTO } from "./recursos.dto";
import type { recurso_categoria } from "../../generated/prisma/enums";

const allowedCategorias: recurso_categoria[] = [
  "COMIDA",
  "AGUA",
  "HIGIENE",
  "DEFENSA",
  "MUNICION",
  "MEDICINA",
  "OTRO",
];

export const getRecursos = async () => {
  return await prisma.recurso.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const getRecursoById = async (id: number) => {
  const recurso = await prisma.recurso.findUnique({
    where: { id_recurso: id },
  });

  if (!recurso) throw new Error("Recurso no encontrado");
  return recurso;
};

export const createRecurso = async (data: CreateRecursoDTO) => {
  const validationError = validateRecurso(data);
  if (validationError) throw new Error(validationError);

  if (!allowedCategorias.includes(data.categoria)) {
    throw new Error(`Categoria inválida. Usa una de: ${allowedCategorias.join(", ")}`);
  }

  return await prisma.recurso.create({
    data: {
      nombre: data.nombre.trim(),
      categoria: data.categoria,
      unidad: data.unidad.trim(),
    },
  });
};

export const updateRecurso = async (id: number, data: UpdateRecursoDTO) => {
  const validationError = validateUpdateRecurso(data);
  if (validationError) throw new Error(validationError);

  if (data.categoria != null && !allowedCategorias.includes(data.categoria)) {
    throw new Error(`Categoria inválida. Usa una de: ${allowedCategorias.join(", ")}`);
  }

  return await prisma.recurso.update({
    where: { id_recurso: id },
    data: {
      ...(data.nombre != null ? { nombre: data.nombre.trim() } : {}),
      ...(data.categoria != null ? { categoria: data.categoria } : {}),
      ...(data.unidad != null ? { unidad: data.unidad.trim() } : {}),
    },
  });
};

export const deleteRecurso = async (id: number) => {
  return await prisma.recurso.delete({
    where: { id_recurso: id },
  });
};

export const seedRecursos = async () => {
  const count = await prisma.recurso.count();
  if (count > 0) {
    return false;
  }

  await prisma.recurso.createMany({
    data: [
      { nombre: "Agua potable", categoria: "AGUA", unidad: "litros" },
      { nombre: "Ración de comida", categoria: "COMIDA", unidad: "porción" },
      { nombre: "Botiquín básico", categoria: "MEDICINA", unidad: "unidad" },
    ],
  });

  return true;
};
