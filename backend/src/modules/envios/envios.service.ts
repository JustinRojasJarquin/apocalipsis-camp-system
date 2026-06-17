import { prisma } from "../../config/prisma";
import {
  ConfirmarSalidaDTO,
  ConfirmarLlegadaDTO,
  CreateEnvioDTO,
  UpdateEnvioDTO,
} from "./envios.dto";
import {
  validateConfirmarSalida,
  validateConfirmarLlegada,
  validateCrearEnvio,
  validateActualizarEnvio,
} from "./envios.schemas";

const includeEnvioCompleto = {
  solicitud_campamento: true,
  campamento_envio_id_campamento_origenTocampamento: true,
  campamento_envio_id_campamento_destinoTocampamento: true,
  envio_recurso: { include: { recurso: true } },
  envio_persona: { include: { persona: { include: { estado_persona: true } } } },
  usuario_envio_id_usuario_aprueba_salidaTousuario: {
    select: { id_usuario: true, usuario: true },
  },
  usuario_envio_id_usuario_aprueba_llegadaTousuario: {
    select: { id_usuario: true, usuario: true },
  },
} as const;

const ensureSolicitudValida = async (
  tx: typeof prisma,
  data: Pick<
    CreateEnvioDTO,
    "id_solicitud" | "id_campamento_origen" | "id_campamento_destino"
  >
) => {
  const solicitud = await tx.solicitud_campamento.findUnique({
    where: { id_solicitud: data.id_solicitud },
    select: {
      id_solicitud: true,
      id_campamento_origen: true,
      id_campamento_destino: true,
      estado: true,
    },
  });

  if (!solicitud) throw new Error("Solicitud no encontrada");
  if (solicitud.estado !== "APROBADA" && solicitud.estado !== "AJUSTADA") {
    throw new Error("La solicitud debe estar APROBADA o AJUSTADA");
  }
  if (
    solicitud.id_campamento_origen !== data.id_campamento_origen ||
    solicitud.id_campamento_destino !== data.id_campamento_destino
  ) {
    throw new Error("El envio no coincide con los campamentos de la solicitud");
  }

  const envioExistente = await tx.envio.findFirst({
    where: {
      id_solicitud: data.id_solicitud,
      estado: { not: "CANCELADO" },
    },
    select: { id_envio: true },
  });

  if (envioExistente) {
    throw new Error("La solicitud ya tiene un envio activo asociado");
  }
};

const ensurePersonasDisponibles = async (
  tx: typeof prisma,
  idCampamentoOrigen: number,
  personas: Array<{ id_persona: number }>
) => {
  for (const item of personas) {
    const persona = await tx.persona.findUnique({
      where: { id_persona: item.id_persona },
      include: { estado_persona: true },
    });

    if (!persona) throw new Error(`Persona ID ${item.id_persona} no encontrada`);
    if (!persona.activo) throw new Error(`Persona ID ${item.id_persona} no esta activa`);
    if (persona.id_campamento !== idCampamentoOrigen) {
      throw new Error(`Persona ID ${item.id_persona} no pertenece al campamento origen`);
    }
    if (persona.estado_persona && !persona.estado_persona.disponible) {
      throw new Error(`Persona ID ${item.id_persona} no esta disponible para envio`);
    }
  }
};

const attachHistorial = async <T extends { id_envio: number; envio_persona?: Array<{ id_persona: number }> }>(
  envios: T[]
) => {
  if (!envios.length) return envios;

  const idsEnvio = envios.map((envio) => envio.id_envio);
  const idsPersona = Array.from(
    new Set(
      envios.flatMap((envio) =>
        (envio.envio_persona ?? []).map((persona) => persona.id_persona)
      )
    )
  );

  const [bitacora, movimientos, asignaciones] = await Promise.all([
    prisma.bitacora.findMany({
      where: { tabla_afectada: "envio", id_registro_afectado: { in: idsEnvio } },
      orderBy: { fecha_hora: "desc" },
    }),
    prisma.inventario_movimiento.findMany({
      where: { origen: { in: ["ENVIO", "ENVIO_CANCELADO"] }, referencia: { in: idsEnvio } },
      include: { recurso: true, campamento: true },
      orderBy: { fecha_hora: "desc" },
    }),
    idsPersona.length
      ? prisma.asignacion_cargo.findMany({
          where: { id_persona: { in: idsPersona } },
          include: { cargo: true, campamento: true },
          orderBy: { fecha_inicio: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return envios.map((envio) => ({
    ...envio,
    historial: {
      bitacora: bitacora.filter((item) => item.id_registro_afectado === envio.id_envio),
      movimientos_inventario: movimientos.filter(
        (item) => item.referencia === envio.id_envio
      ),
      asignaciones_personas: asignaciones.filter((item) =>
        (envio.envio_persona ?? []).some(
          (persona) => persona.id_persona === item.id_persona
        )
      ),
    },
  }));
};

export const listarEnvios = async (filters?: {
  idCampamento?: number;
  estado?: string;
}) => {
  const envios = await prisma.envio.findMany({
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

  return attachHistorial(envios);
};

export const obtenerEnvio = async (id: number) => {
  const envio = await prisma.envio.findUnique({
    where: { id_envio: id },
    include: includeEnvioCompleto,
  });

  if (!envio) return null;

  const [envioConHistorial] = await attachHistorial([envio]);
  return envioConHistorial;
};

export const crearEnvio = async (data: CreateEnvioDTO, idUsuario: number) => {
  validateCrearEnvio(data);

  return prisma.$transaction(async (tx) => {
    await ensureSolicitudValida(tx as typeof prisma, data);
    await ensurePersonasDisponibles(
      tx as typeof prisma,
      data.id_campamento_origen,
      data.personas ?? []
    );

    const envio = await tx.envio.create({
      data: {
        id_solicitud: data.id_solicitud,
        id_campamento_origen: data.id_campamento_origen,
        id_campamento_destino: data.id_campamento_destino,
        fecha_salida_programada: new Date(data.fecha_salida_programada),
        fecha_llegada_programada: new Date(data.fecha_llegada_programada),
        estado: "PENDIENTE",
        envio_recurso: {
          create:
            data.recursos?.map((recurso) => ({
              id_recurso: recurso.id_recurso,
              cantidad_enviada: recurso.cantidad_enviada,
            })) ?? [],
        },
        envio_persona: {
          create:
            data.personas?.map((persona) => ({
              id_persona: persona.id_persona,
              raciones_viaje: persona.raciones_viaje ?? 0,
            })) ?? [],
        },
      },
      include: includeEnvioCompleto,
    });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: data.id_campamento_origen,
        tipo_accion: "CREAR_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: envio.id_envio,
        descripcion: `Envio ${envio.id_envio} creado para solicitud ${data.id_solicitud}`,
      },
    });

    return envio;
  });
};

export const actualizarEnvio = async (
  idEnvio: number,
  data: UpdateEnvioDTO,
  idUsuario: number
) => {
  validateActualizarEnvio(data);

  return prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id_envio: idEnvio },
      include: { envio_recurso: true, envio_persona: true },
    });

    if (!envio) throw new Error("Envio no encontrado");
    if (envio.estado !== "PENDIENTE") {
      throw new Error("Solo se pueden editar envios en estado PENDIENTE");
    }

    const fechaSalidaProgramada = data.fecha_salida_programada
      ? new Date(data.fecha_salida_programada)
      : envio.fecha_salida_programada;
    const fechaLlegadaProgramada = data.fecha_llegada_programada
      ? new Date(data.fecha_llegada_programada)
      : envio.fecha_llegada_programada;

    if (fechaLlegadaProgramada <= fechaSalidaProgramada) {
      throw new Error(
        "fecha_llegada_programada debe ser posterior a fecha_salida_programada"
      );
    }

    await ensurePersonasDisponibles(
      tx as typeof prisma,
      envio.id_campamento_origen,
      data.personas ?? envio.envio_persona
    );

    if (data.recursos) {
      await tx.envio_recurso.deleteMany({ where: { id_envio: idEnvio } });
      await tx.envio_recurso.createMany({
        data: data.recursos.map((recurso) => ({
          id_envio: idEnvio,
          id_recurso: recurso.id_recurso,
          cantidad_enviada: recurso.cantidad_enviada,
        })),
      });
    }

    if (data.personas) {
      await tx.envio_persona.deleteMany({ where: { id_envio: idEnvio } });
      await tx.envio_persona.createMany({
        data: data.personas.map((persona) => ({
          id_envio: idEnvio,
          id_persona: persona.id_persona,
          raciones_viaje: persona.raciones_viaje ?? 0,
        })),
      });
    }

    const envioActualizado = await tx.envio.update({
      where: { id_envio: idEnvio },
      data: {
        ...(data.fecha_salida_programada
          ? { fecha_salida_programada: fechaSalidaProgramada }
          : {}),
        ...(data.fecha_llegada_programada
          ? { fecha_llegada_programada: fechaLlegadaProgramada }
          : {}),
      },
      include: includeEnvioCompleto,
    });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: envio.id_campamento_origen,
        tipo_accion: "ACTUALIZAR_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: idEnvio,
        descripcion: `Envio ${idEnvio} actualizado`,
      },
    });

    return envioActualizado;
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
      include: { envio_recurso: true, envio_persona: true },
    });

    if (!envio) throw new Error("Envío no encontrado");
    if (envio.estado !== "PENDIENTE")
      throw new Error("El envío no está en estado PENDIENTE");

    // Verificar stock y guardar valores actuales para aritmética explícita
    await ensurePersonasDisponibles(
      tx as typeof prisma,
      envio.id_campamento_origen,
      envio.envio_persona
    );

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

export const eliminarEnvio = async (idEnvio: number, idUsuario: number) => {
  return prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id_envio: idEnvio },
      select: {
        id_envio: true,
        estado: true,
        id_campamento_origen: true,
      },
    });

    if (!envio) throw new Error("Envio no encontrado");
    if (envio.estado !== "PENDIENTE" && envio.estado !== "CANCELADO") {
      throw new Error("Solo se pueden eliminar envios PENDIENTES o CANCELADOS");
    }

    await tx.envio_recurso.deleteMany({ where: { id_envio: idEnvio } });
    await tx.envio_persona.deleteMany({ where: { id_envio: idEnvio } });
    await tx.envio.delete({ where: { id_envio: idEnvio } });

    await tx.bitacora.create({
      data: {
        id_usuario: idUsuario,
        id_campamento: envio.id_campamento_origen,
        tipo_accion: "ELIMINAR_ENVIO",
        tabla_afectada: "envio",
        id_registro_afectado: idEnvio,
        descripcion: `Envio ${idEnvio} eliminado`,
      },
    });

    return envio;
  });
};
