import { prisma } from "../../config/prisma";
import { validateResource } from "./inventario.schemas";
import type {
  CreateInventarioCampamentoDTO,
  UpdateInventarioCampamentoDTO,
} from "./inventario.dto";

export const getAllResources = async (campId?: number) => {
  const data = await prisma.inventario_campamento.findMany({
    where: campId ? { id_campamento: campId } : undefined,
    include: {
      recurso: true,
      campamento: true,
    },
  });

  return data.map((item) => {
    const cantidad = Number(item.cantidad);
    const minimo = Number(item.minimo_alerta);

    return {
      id: item.id_recurso,
      name: item.recurso.nombre,
      quantity: cantidad,
      minThreshold: minimo,
      campId: item.id_campamento,
      campamentoNombre: item.campamento.nombre,
      status: cantidad <= minimo ? "critical" : "stable",
    };
  });
};

export const getAvailableResources = async () => {
  return await prisma.recurso.findMany({
    select: {
      id_recurso: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
};

export const createResource = async (
  data: CreateInventarioCampamentoDTO,
) => {
  const validationError = validateResource(data);
  if (validationError) {
    throw new Error(validationError);
  }

  const resourceExists = await prisma.recurso.findUnique({
    where: { id_recurso: data.resourceId },
  });

  if (!resourceExists) {
    throw new Error(
      `No existe un recurso con id ${data.resourceId}. Usa un recurso válido.`,
    );
  }

  const campamentoExists = await prisma.campamento.findUnique({
    where: { id_campamento: data.campId },
  });

  if (!campamentoExists) {
    throw new Error(`No existe un campamento con id ${data.campId}.`);
  }

  const exists = await prisma.inventario_campamento.findUnique({
    where: {
      id_campamento_id_recurso: {
        id_campamento: data.campId,
        id_recurso: data.resourceId,
      },
    },
  });

  if (exists) {
    throw new Error("Este recurso ya existe en ese campamento");
  }

  try {
    return await prisma.inventario_campamento.create({
      data: {
        id_campamento: data.campId,
        id_recurso: data.resourceId,
        cantidad: data.quantity,
        minimo_alerta: data.minThreshold,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint violated")
    ) {
      throw new Error(
        "El recurso o campamento no existe. Verifica los IDs antes de crear el inventario.",
      );
    }
    throw error;
  }
};

export const updateResource = async (
  campId: number,
  resourceId: number,
  data: UpdateInventarioCampamentoDTO,
) => {
  const payload = {
    campId,
    resourceId,
    quantity: data.quantity,
    minThreshold: data.minThreshold,
  };
  const validationError = validateResource(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  return await prisma.inventario_campamento.update({
    where: {
      id_campamento_id_recurso: {
        id_campamento: campId,
        id_recurso: resourceId,
      },
    },
    data: {
      cantidad: data.quantity,
      minimo_alerta: data.minThreshold,
    },
  });
};

export const deleteResource = async (campId: number, resourceId: number) => {
  return await prisma.inventario_campamento.delete({
    where: {
      id_campamento_id_recurso: {
        id_campamento: campId,
        id_recurso: resourceId,
      },
    },
  });
};