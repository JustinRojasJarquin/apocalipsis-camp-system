import { prisma } from "../../config/prisma";
import { validateResource, validateProduccion, validateRacion } from "./inventario.schemas";
import type {
  CreateInventarioCampamentoDTO,
  UpdateInventarioCampamentoDTO,
  CreateProduccionDiariaDTO,
  CreateRacionDiariaDTO,
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

export const createProduccion = async (payload: CreateProduccionDiariaDTO) => {
  const validationError = validateProduccion(payload);
  if (validationError) throw new Error(validationError);

  const fecha = payload.fecha ? new Date(payload.fecha) : new Date();

  return await prisma.$transaction(async (tx) => {
    const prod = await tx.produccion_diaria.create({
      data: {
        fecha: fecha,
        id_persona: payload.personaId,
        id_campamento: payload.campId,
        id_recurso: payload.resourceId,
        cantidad: payload.cantidad,
        ajuste_razon: payload.ajusteRazon || null,
        observaciones: payload.observaciones || null,
      },
    });

    const invent = await tx.inventario_campamento.findUnique({
      where: {
        id_campamento_id_recurso: {
          id_campamento: payload.campId,
          id_recurso: payload.resourceId,
        },
      },
    });

    if (invent) {
      await tx.inventario_campamento.update({
        where: {
          id_campamento_id_recurso: {
            id_campamento: payload.campId,
            id_recurso: payload.resourceId,
          },
        },
        data: { cantidad: Number(invent.cantidad) + payload.cantidad },
      });
    } else {
      await tx.inventario_campamento.create({
        data: {
          id_campamento: payload.campId,
          id_recurso: payload.resourceId,
          cantidad: payload.cantidad,
          minimo_alerta: 0,
        },
      });
    }

    await tx.inventario_movimiento.create({
      data: {
        id_campamento: payload.campId,
        id_recurso: payload.resourceId,
        fecha_hora: new Date(),
        tipo: "PRODUCCION",
        origen: "Produccion",
        referencia: prod.id_produccion,
        cantidad: payload.cantidad,
        id_usuario: payload.personaId,
      },
    });

    return prod;
  });
};

export const createRacion = async (payload: CreateRacionDiariaDTO) => {
  const validationError = validateRacion(payload);
  if (validationError) throw new Error(validationError);

  const fecha = payload.fecha ? new Date(payload.fecha) : new Date();

  return await prisma.$transaction(async (tx) => {
    const inv = await tx.inventario_campamento.findUnique({
      where: {
        id_campamento_id_recurso: {
          id_campamento: payload.campId,
          id_recurso: payload.resourceId,
        },
      },
    });

    if (!inv) throw new Error("Inventario no existe para ese campamento y recurso");
    const current = Number(inv.cantidad);
    if (current < payload.cantidad) throw new Error("Inventario insuficiente para ración");

    const racion = await tx.racion_diaria.create({
      data: {
        fecha: fecha,
        id_persona: payload.personaId,
        id_campamento: payload.campId,
        id_recurso: payload.resourceId,
        cantidad: payload.cantidad,
      },
    });

    await tx.inventario_campamento.update({
      where: {
        id_campamento_id_recurso: {
          id_campamento: payload.campId,
          id_recurso: payload.resourceId,
        },
      },
      data: { cantidad: current - payload.cantidad },
    });

    await tx.inventario_movimiento.create({
      data: {
        id_campamento: payload.campId,
        id_recurso: payload.resourceId,
        fecha_hora: new Date(),
        tipo: "RACION",
        origen: "Racion",
        referencia: racion.id_racion,
        cantidad: payload.cantidad,
        id_usuario: payload.personaId,
      },
    });

    return racion;
  });
};

export const recalculateInventoryForDate = async (campId: number, dateIso?: string) => {
  const date = dateIso ? new Date(dateIso) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  // sumar produccion por recurso
  const producciones = await prisma.produccion_diaria.groupBy({
    by: ["id_recurso"],
    where: { id_campamento: campId, fecha: { gte: start, lt: end } },
    _sum: { cantidad: true },
  });

  const raciones = await prisma.racion_diaria.groupBy({
    by: ["id_recurso"],
    where: { id_campamento: campId, fecha: { gte: start, lt: end } },
    _sum: { cantidad: true },
  });

  const mapProd = new Map(producciones.map((p) => [p.id_recurso, Number(p._sum.cantidad || 0)]));
  const mapRac = new Map(raciones.map((r) => [r.id_recurso, Number(r._sum.cantidad || 0)]));

  const resourceIds = new Set<number>([...mapProd.keys(), ...mapRac.keys()]);

  const results: Array<{ resourceId: number; produced: number; consumed: number; before: number; after: number }> = [];

  await prisma.$transaction(async (tx) => {
    for (const rid of resourceIds) {
      const prod = mapProd.get(rid) || 0;
      const rac = mapRac.get(rid) || 0;

      const inv = await tx.inventario_campamento.findUnique({
        where: { id_campamento_id_recurso: { id_campamento: campId, id_recurso: rid } },
      });

      const before = inv ? Number(inv.cantidad) : 0;
      const after = before + prod - rac;

      if (inv) {
        await tx.inventario_campamento.update({
          where: { id_campamento_id_recurso: { id_campamento: campId, id_recurso: rid } },
          data: { cantidad: after },
        });
      } else {
        await tx.inventario_campamento.create({
          data: { id_campamento: campId, id_recurso: rid, cantidad: after, minimo_alerta: 0 },
        });
      }

      results.push({ resourceId: rid, produced: prod, consumed: rac, before, after });
    }
  });

  return results;
};