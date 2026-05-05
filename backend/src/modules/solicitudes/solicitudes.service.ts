import { prisma } from "../../config/prisma";

export const crearSolicitud = async (data: any, idUsuario: number) => {
  if (data.id_campamento_origen === data.id_campamento_destino) {
    throw new Error("El campamento origen y destino no pueden ser iguales");
  }

  return prisma.solicitud_campamento.create({
    data: {
      id_campamento_origen: Number(data.id_campamento_origen),
      id_campamento_destino: Number(data.id_campamento_destino),
      tipo: data.tipo,
      estado: "PENDIENTE",
      fecha_creacion: new Date(),
      id_usuario_crea: idUsuario,
      motivo: data.motivo ?? null,
      solicitud_recurso: {
        create:
          data.recursos?.map((r: any) => ({
            id_recurso: Number(r.id_recurso),
            cantidad_pedida: Number(r.cantidad_pedida),
            cantidad_aprobada: r.cantidad_aprobada
              ? Number(r.cantidad_aprobada)
              : null,
          })) ?? [],
      },
      solicitud_persona: {
        create:
          data.personas?.map((p: any) => ({
            id_cargo: Number(p.id_cargo),
            cantidad_personas: Number(p.cantidad_personas),
          })) ?? [],
      },
    },
    include: {
      solicitud_recurso: { include: { recurso: true } },
      solicitud_persona: { include: { cargo: true } },
    },
  });
};

export const listarSolicitudes = async (filters?: {
  idCampamento?: number;
  estado?: string;
}) => {
  return prisma.solicitud_campamento.findMany({
    where: {
      ...(filters?.estado
        ? { estado: filters.estado as any }
        : {}),

      ...(filters?.idCampamento
        ? {
            OR: [
              { id_campamento_origen: filters.idCampamento },
              { id_campamento_destino: filters.idCampamento },
            ],
          }
        : {}),
    },
    include: {
      campamento_solicitud_campamento_id_campamento_origenTocampamento: true,
      campamento_solicitud_campamento_id_campamento_destinoTocampamento: true,
      solicitud_recurso: { include: { recurso: true } },
      solicitud_persona: { include: { cargo: true } },
      envio: true,
    },
    orderBy: { fecha_creacion: "desc" },
  });
};

export const obtenerSolicitud = async (id: number) => {
  return prisma.solicitud_campamento.findUnique({
    where: { id_solicitud: id },
    include: {
      solicitud_recurso: { include: { recurso: true } },
      solicitud_persona: { include: { cargo: true } },
      envio: {
        include: {
          envio_recurso: { include: { recurso: true } },
          envio_persona: { include: { persona: true } },
        },
      },
    },
  });
};

export const responderSolicitud = async (
  idSolicitud: number,
  data: any,
  idUsuario: number
) => {
  return prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitud_campamento.findUnique({
      where: { id_solicitud: idSolicitud },
      include: {
        solicitud_recurso: true,
        solicitud_persona: true,
      },
    });

    if (!solicitud) {
      throw new Error("Solicitud no encontrada");
    }

    if (solicitud.estado !== "PENDIENTE") {
      throw new Error("La solicitud ya fue procesada");
    }

    for (const recurso of data.recursos_aprobados ?? []) {
      await tx.solicitud_recurso.update({
        where: { id_solicitud_rec: Number(recurso.id_solicitud_rec) },
        data: { cantidad_aprobada: Number(recurso.cantidad_aprobada) },
      });
    }

    const solicitudActualizada = await tx.solicitud_campamento.update({
      where: { id_solicitud: idSolicitud },
      data: {
        estado: data.estado,
        respuesta: data.respuesta ?? null,
        id_usuario_decide: idUsuario,
        fecha_decision: new Date(),
      },
    });

    if (data.estado === "APROBADA" || data.estado === "AJUSTADA") {
      const envio = await tx.envio.create({
        data: {
          id_solicitud: idSolicitud,
          id_campamento_origen: solicitud.id_campamento_origen,
          id_campamento_destino: solicitud.id_campamento_destino,
          fecha_salida_programada: data.fecha_salida_programada
            ? new Date(data.fecha_salida_programada)
            : new Date(),
          fecha_llegada_programada: data.fecha_llegada_programada
            ? new Date(data.fecha_llegada_programada)
            : new Date(),
          estado: "PENDIENTE",
        },
      });

      const recursosActualizados = await tx.solicitud_recurso.findMany({
        where: { id_solicitud: idSolicitud },
      });

      for (const recurso of recursosActualizados) {
        await tx.envio_recurso.create({
          data: {
            id_envio: envio.id_envio,
            id_recurso: recurso.id_recurso,
            cantidad_enviada:
              recurso.cantidad_aprobada ?? recurso.cantidad_pedida,
          },
        });
      }

      for (const personaSolicitada of solicitud.solicitud_persona) {
        const personas = await tx.persona.findMany({
          where: {
            id_campamento: solicitud.id_campamento_origen,
            id_cargo_actual: personaSolicitada.id_cargo,
            activo: true,
          },
          take: personaSolicitada.cantidad_personas,
        });

        for (const persona of personas) {
          await tx.envio_persona.create({
            data: {
              id_envio: envio.id_envio,
              id_persona: persona.id_persona,
              raciones_viaje: data.raciones_viaje ?? 0,
            },
          });
        }
      }
    }

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: solicitud.id_campamento_destino,
        tipo_accion: "RESPONDER_SOLICITUD",
        tabla_afectada: "solicitud_campamento",
        id_registro_afectado: idSolicitud,
        descripcion: `Solicitud ${idSolicitud} marcada como ${data.estado}`,
      },
    });

    return solicitudActualizada;
  });
};