import { prisma } from "../../config/prisma";
import {
  validateCreateCampamento,
  validateUpdateCampamento,
} from "./campamentos.schemas";
import type {
  CreateCampamentoDTO,
  UpdateCampamentoDTO,
} from "./campamentos.dto";

const normalizeCampamentoData = (
  data: CreateCampamentoDTO | UpdateCampamentoDTO,
) => ({
  ...("nombre" in data && data.nombre !== undefined
    ? { nombre: data.nombre.trim() }
    : {}),
  ...("ubicacion" in data
    ? { ubicacion: data.ubicacion?.trim() || null }
    : {}),
  ...("descripcion" in data
    ? { descripcion: data.descripcion?.trim() || null }
    : {}),
  ...("activo" in data && data.activo !== undefined
    ? { activo: data.activo }
    : {}),
});

export const getCampamentos = async () => {
  return await prisma.campamento.findMany({
    where: { activo: true },
  });
};

export const createCampamento = async (data: CreateCampamentoDTO) => {
  validateCreateCampamento(data);
  const campamentoData = normalizeCampamentoData(data);

  return await prisma.campamento.create({
    data: {
      nombre: campamentoData.nombre!,
      ubicacion: campamentoData.ubicacion,
      descripcion: campamentoData.descripcion,
      activo: true, // por defecto
    },
  });
};

export const updateCampamento = async (
  id: number,
  data: UpdateCampamentoDTO,
) => {
  if (!id) {
    throw new Error("ID inválido");
  }

  validateUpdateCampamento(data);

  return await prisma.campamento.update({
    where: { id_campamento: id },
    data: normalizeCampamentoData(data),
  });
};

export const deleteCampamento = async (id: number) => {
  if (!id) {
    throw new Error("ID inválido");
  }

  return await prisma.campamento.update({
    where: { id_campamento: id },
    data: { activo: false },
  });
};
