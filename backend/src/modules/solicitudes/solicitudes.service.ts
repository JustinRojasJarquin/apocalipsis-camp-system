import { prisma } from "../../config/prisma";
import type { CreateSolicitudDTO, ResponderSolicitudDTO } from "./solicitudes.dto";
import { validateCrearSolicitud, validateResponderSolicitud } from "./solicitudes.schemas";

export const crearSolicitud = async (data: CreateSolicitudDTO, idUsuario: number) => {
  validateCrearSolicitud(data);

  return prisma.solicitud_campamento.create({
    data: {
      id_campamento_origen: data.id_campamento_origen,
      id_campamento_destino: data.id_campamento_destino,
      tipo: data.tipo,
      estado: "PENDIENTE",
      fecha_creacion: new Date(),
      id_usuario_crea: idUsuario,
      motivo: data.motivo ?? null,
      solicitud_recurso: {
        create:
          data.recursos?.map((r) => ({
            id_recurso: r.id_recurso,
            cantidad_pedida: r.cantidad_pedida,
          })) ?? [],
      },
      solicitud_persona: {
        create:
          data.personas?.map((p) => ({
            id_cargo: p.id_cargo,
            cantidad_personas: p.cantidad_personas,
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
      envio: {
        include: {
          envio_persona: { include: { persona: true } },
          envio_recurso: { include: { recurso: true } },
        },
      },
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
  data: ResponderSolicitudDTO,
  idUsuario: number
) => {
  validateResponderSolicitud(data);

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
