import { prisma } from "../../config/prisma";
import { ConfirmarSalidaDTO, ConfirmarLlegadaDTO } from "./envios.dto";
import {
  validateConfirmarSalida,
  validateConfirmarLlegada,
} from "./envios.schemas";

const includeEnvioCompleto = {
  solicitud_campamento: true,
  campamento_envio_id_campamento_origenTocampamento: true,
  campamento_envio_id_campamento_destinoTocampamento: true,
  envio_recurso: { include: { recurso: true } },
  envio_persona: { include: { persona: true } },
  usuario_envio_id_usuario_aprueba_salidaTousuario: {
    select: { id_usuario: true, usuario: true },
  },
  usuario_envio_id_usuario_aprueba_llegadaTousuario: {
    select: { id_usuario: true, usuario: true },
  },
} as const;

export const listarEnvios = async (filters?: {
  idCampamento?: number;
  estado?: string;
}) => {
  return prisma.envio.findMany({
    where: {
      ...(filters?.estado ? { estado: filters.estado as any } : {}),
      ...(filters?.idCampamento
        ? {
            OR: [
              { id_campamento_origen: filters.idCampamento },
              { id_campamento_destino: filters.idCampamento },
            ],
          }
        : {}),
    },
    include: includeEnvioCompleto,
    orderBy: { fecha_salida_programada: "asc" },
  });
};

export const obtenerEnvio = async (id: number) => {
  return prisma.envio.findUnique({
    where: { id_envio: id },
    include: includeEnvioCompleto,
  });
};

export const confirmarSalida = async (
  idEnvio: number,
  data: ConfirmarSalidaDTO,
  idUsuario: number
) => {
  validateConfirmarSalida(data);

  return prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id_envio: idEnvio },
      include: { envio_recurso: true },
    });

    if (!envio) throw new Error("Envío no encontrado");
    if (envio.estado !== "PENDIENTE")
      throw new Error("El envío no está en estado PENDIENTE");

    // Verificar stock y guardar valores actuales para aritmética explícita
    const stockOrigen = new Map<number, number>();
    for (const er of envio.envio_recurso) {
      const inv = await tx.inventario_campamento.findUnique({
        where: {
          id_campamento_id_recurso: {
            id_campamento: envio.id_campamento_origen,
            id_recurso: er.id_recurso,
          },
        },
      });

      if (!inv || Number(inv.cantidad) < Number(er.cantidad_enviada)) {
        throw new Error(
          `Stock insuficiente para el recurso ID ${er.id_recurso} en el campamento origen`
        );
      }

      stockOrigen.set(er.id_recurso, Number(inv.cantidad));
    }

    const fechaSalida = data.fecha_salida_aprobada
      ? new Date(data.fecha_salida_aprobada)
      : new Date();

    // Descontar inventario origen con aritmética explícita (igual que inventario.service.ts)
    for (const er of envio.envio_recurso) {
      const cantidadActual = stockOrigen.get(er.id_recurso)!;

      await tx.inventario_campamento.update({
        where: {
          id_campamento_id_recurso: {
            id_campamento: envio.id_campamento_origen,
            id_recurso: er.id_recurso,
          },
        },
        data: { cantidad: cantidadActual - Number(er.cantidad_enviada) },
      });

      await tx.inventario_movimiento.create({
        data: {
          id_campamento: envio.id_campamento_origen,
          id_recurso: er.id_recurso,
          fecha_hora: fechaSalida,
          tipo: "TRASLADO_SALIDA",
          origen: "ENVIO",
          referencia: idEnvio,
          cantidad: er.cantidad_enviada,
          id_usuario: idUsuario,
        },
      });
    }

    const envioActualizado = await tx.envio.update({
      where: { id_envio: idEnvio },
      data: {
        estado: "EN_TRANSITO",
        fecha_salida_aprobada: fechaSalida,
        id_usuario_aprueba_salida: idUsuario,
      },
    });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: envio.id_campamento_origen,
        tipo_accion: "CONFIRMAR_SALIDA_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: idEnvio,
        descripcion: `Envío ${idEnvio} salió hacia campamento ${envio.id_campamento_destino}`,
      },
    });

    return envioActualizado;
  });
};

export const confirmarLlegada = async (
  idEnvio: number,
  data: ConfirmarLlegadaDTO,
  idUsuario: number
) => {
  validateConfirmarLlegada(data);

  return prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id_envio: idEnvio },
      include: { envio_recurso: true, envio_persona: true },
    });

    if (!envio) throw new Error("Envío no encontrado");
    if (envio.estado !== "EN_TRANSITO")
      throw new Error("El envío no está en estado EN_TRANSITO");

    const fechaLlegada = data.fecha_llegada_aprobada
      ? new Date(data.fecha_llegada_aprobada)
      : new Date();

    // Abonar inventario destino con aritmética explícita (igual que inventario.service.ts)
    for (const er of envio.envio_recurso) {
      const cantidadRecibida =
        data.recursos_recibidos?.find(
          (r) => r.id_envio_recurso === er.id_envio_recurso
        )?.cantidad_recibida ?? Number(er.cantidad_enviada);

      await tx.envio_recurso.update({
        where: { id_envio_recurso: er.id_envio_recurso },
        data: { cantidad_recibida: cantidadRecibida },
      });

      const invDestino = await tx.inventario_campamento.findUnique({
        where: {
          id_campamento_id_recurso: {
            id_campamento: envio.id_campamento_destino,
            id_recurso: er.id_recurso,
          },
        },
      });

      if (invDestino) {
        await tx.inventario_campamento.update({
          where: {
            id_campamento_id_recurso: {
              id_campamento: envio.id_campamento_destino,
              id_recurso: er.id_recurso,
            },
          },
          data: { cantidad: Number(invDestino.cantidad) + cantidadRecibida },
        });
      } else {
        await tx.inventario_campamento.create({
          data: {
            id_campamento: envio.id_campamento_destino,
            id_recurso: er.id_recurso,
            cantidad: cantidadRecibida,
            minimo_alerta: 0,
          },
        });
      }

      await tx.inventario_movimiento.create({
        data: {
          id_campamento: envio.id_campamento_destino,
          id_recurso: er.id_recurso,
          fecha_hora: fechaLlegada,
          tipo: "TRASLADO_ENTRADA",
          origen: "ENVIO",
          referencia: idEnvio,
          cantidad: cantidadRecibida,
          id_usuario: idUsuario,
        },
      });
    }

    // Trasladar personas al campamento destino
    // Igual que personas.service.ts: cierra asignacion_cargo actual y crea una nueva
    for (const ep of envio.envio_persona) {
      const persona = await tx.persona.findUnique({
        where: { id_persona: ep.id_persona },
        select: { id_cargo_actual: true },
      });

      await tx.persona.update({
        where: { id_persona: ep.id_persona },
        data: { id_campamento: envio.id_campamento_destino },
      });

      if (persona?.id_cargo_actual) {
        await tx.asignacion_cargo.updateMany({
          where: { id_persona: ep.id_persona, fecha_fin: null },
          data: { fecha_fin: fechaLlegada },
        });

        await tx.asignacion_cargo.create({
          data: {
            id_persona: ep.id_persona,
            id_campamento: envio.id_campamento_destino,
            id_cargo: persona.id_cargo_actual,
            fecha_inicio: fechaLlegada,
            temporal: false,
          },
        });
      }
    }

    const envioActualizado = await tx.envio.update({
      where: { id_envio: idEnvio },
      data: {
        estado: "COMPLETADO",
        fecha_llegada_aprobada: fechaLlegada,
        id_usuario_aprueba_llegada: idUsuario,
      },
    });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: envio.id_campamento_destino,
        tipo_accion: "CONFIRMAR_LLEGADA_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: idEnvio,
        descripcion: `Envío ${idEnvio} llegó al campamento ${envio.id_campamento_destino}`,
      },
    });

    return envioActualizado;
  });
};

export const cancelarEnvio = async (idEnvio: number, idUsuario: number) => {
  return prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id_envio: idEnvio },
      include: { envio_recurso: true },
    });

    if (!envio) throw new Error("Envío no encontrado");
    if (envio.estado !== "PENDIENTE" && envio.estado !== "EN_TRANSITO") {
      throw new Error(
        "Solo se pueden cancelar envíos en estado PENDIENTE o EN_TRANSITO"
      );
    }

    // Si ya salió (EN_TRANSITO) devolver el stock al origen con aritmética explícita
    if (envio.estado === "EN_TRANSITO") {
      for (const er of envio.envio_recurso) {
        const invOrigen = await tx.inventario_campamento.findUnique({
          where: {
            id_campamento_id_recurso: {
              id_campamento: envio.id_campamento_origen,
              id_recurso: er.id_recurso,
            },
          },
        });

        if (invOrigen) {
          await tx.inventario_campamento.update({
            where: {
              id_campamento_id_recurso: {
                id_campamento: envio.id_campamento_origen,
                id_recurso: er.id_recurso,
              },
            },
            data: { cantidad: Number(invOrigen.cantidad) + Number(er.cantidad_enviada) },
          });
        } else {
          await tx.inventario_campamento.create({
            data: {
              id_campamento: envio.id_campamento_origen,
              id_recurso: er.id_recurso,
              cantidad: er.cantidad_enviada,
              minimo_alerta: 0,
            },
          });
        }

        await tx.inventario_movimiento.create({
          data: {
            id_campamento: envio.id_campamento_origen,
            id_recurso: er.id_recurso,
            fecha_hora: new Date(),
            tipo: "TRASLADO_ENTRADA",
            origen: "ENVIO_CANCELADO",
            referencia: idEnvio,
            cantidad: er.cantidad_enviada,
            id_usuario: idUsuario,
          },
        });
      }
    }

    const envioActualizado = await tx.envio.update({
      where: { id_envio: idEnvio },
      data: { estado: "CANCELADO" },
    });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: envio.id_campamento_origen,
        tipo_accion: "CANCELAR_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: idEnvio,
        descripcion: `Envío ${idEnvio} cancelado desde estado ${envio.estado}`,
      },
    });

    return envioActualizado;
  });
};
