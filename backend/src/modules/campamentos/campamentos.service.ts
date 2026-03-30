import { prisma } from "../../config/prisma";
import {
  validateCreateCampamento,
  validateUpdateCampamento,
} from "./campamentos.schemas";
import type {
  CreateCampamentoDTO,
  UpdateCampamentoDTO,
} from "./campamentos.dto";

export const getCampamentos = async () => {
  return await prisma.campamento.findMany({
    where: { activo: true },
  });
};

export const createCampamento = async (data: CreateCampamentoDTO) => {
  validateCreateCampamento(data);

  return await prisma.campamento.create({
    data: {
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion,
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
    data,
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
