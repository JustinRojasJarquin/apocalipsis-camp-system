import { prisma } from "../../config/prisma";
import type {
  CrearExploracionDto,
  ActualizarEstadoDto,
  AsignarPersonaDto,
  AgregarRecursoLlevadoDto,
  RegistrarRecursoEncontradoDto,
} from "./exploraciones.dto";

// ─── Listar exploraciones de un campamento ───────────────────────────────────

export const listarExploraciones = async (id_campamento: number) => {
  return await prisma.exploracion.findMany({
    where: { id_campamento },
    include: {
      exploracion_persona: true,
      exploracion_recurso_llevado: true,
      exploracion_recurso_encontrado: true,
    },
    orderBy: { fecha_inicio_plan: "desc" },
  });
};

// ─── Obtener una exploración con detalle completo ────────────────────────────

export const obtenerExploracion = async (id_exploracion: number) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
    include: {
      exploracion_persona: true,
      exploracion_recurso_llevado: true,
      exploracion_recurso_encontrado: true,
    },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  return exploracion;
};

// ─── Crear exploración ───────────────────────────────────────────────────────

export const crearExploracion = async (datos: CrearExploracionDto) => {
  const campamento = await prisma.campamento.findUnique({
    where: { id_campamento: datos.id_campamento },
  });

  if (!campamento) {
    throw new Error("El campamento especificado no existe");
  }

  return await prisma.exploracion.create({
    data: {
      id_campamento: datos.id_campamento,
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      fecha_inicio_plan: new Date(datos.fecha_inicio_plan),
      dias_estimados: datos.dias_estimados,
      dias_extra: datos.dias_extra ?? 0,
      estado: "PLANIFICADA",
    },
  });
};

// ─── Actualizar estado ───────────────────────────────────────────────────────

export const actualizarEstado = async (
  id_exploracion: number,
  datos: ActualizarEstadoDto,
  idUsuario: number
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  const ahora = new Date();
  const updateData: any = { estado: datos.estado };

  if (datos.estado === "EN_PROGRESO" && !exploracion.fecha_inicio_real) {
    updateData.fecha_inicio_real = ahora;
  }

  if (
    (datos.estado === "COMPLETADA" ||
      datos.estado === "CANCELADA" ||
      datos.estado === "FALLIDA") &&
    !exploracion.fecha_fin_real
  ) {
    updateData.fecha_fin_real = ahora;
  }

  if (datos.dias_extra_usados !== undefined) {
    updateData.dias_extra_usados = datos.dias_extra_usados;
  }

  // Al iniciar: descontar recursos llevados del inventario
  if (datos.estado === "EN_PROGRESO" && !exploracion.fecha_inicio_real) {
    return prisma.$transaction(async (tx) => {
      const recursosLlevados = await tx.exploracion_recurso_llevado.findMany({
        where: { id_exploracion },
      });

      for (const recurso of recursosLlevados) {
        const inv = await tx.inventario_campamento.findUnique({
          where: {
            id_campamento_id_recurso: {
              id_campamento: exploracion.id_campamento,
              id_recurso: recurso.id_recurso,
            },
          },
        });

        if (!inv || Number(inv.cantidad) < Number(recurso.cantidad_llevada)) {
          throw new Error(`Stock insuficiente para recurso ID ${recurso.id_recurso} al iniciar exploración`);
        }

        await tx.inventario_campamento.update({
          where: {
            id_campamento_id_recurso: {
              id_campamento: exploracion.id_campamento,
              id_recurso: recurso.id_recurso,
            },
          },
          data: { cantidad: Number(inv.cantidad) - Number(recurso.cantidad_llevada) },
        });

        await tx.inventario_movimiento.create({
          data: {
            id_campamento: exploracion.id_campamento,
            id_recurso: recurso.id_recurso,
            fecha_hora: ahora,
            tipo: "TRASLADO_SALIDA",
            origen: "EXPLORACION",
            referencia: id_exploracion,
            cantidad: recurso.cantidad_llevada,
            id_usuario: idUsuario,
          },
        });
      }

      return tx.exploracion.update({ where: { id_exploracion }, data: updateData });
    });
  }

  // Al cancelar o fallar estando EN_PROGRESO: devolver recursos al inventario
  if (
    (datos.estado === "CANCELADA" || datos.estado === "FALLIDA") &&
    exploracion.estado === "EN_PROGRESO"
  ) {
    return prisma.$transaction(async (tx) => {
      const recursosLlevados = await tx.exploracion_recurso_llevado.findMany({
        where: { id_exploracion },
      });

      for (const recurso of recursosLlevados) {
        const inv = await tx.inventario_campamento.findUnique({
          where: {
            id_campamento_id_recurso: {
              id_campamento: exploracion.id_campamento,
              id_recurso: recurso.id_recurso,
            },
          },
        });

        if (inv) {
          await tx.inventario_campamento.update({
            where: {
              id_campamento_id_recurso: {
                id_campamento: exploracion.id_campamento,
                id_recurso: recurso.id_recurso,
              },
            },
            data: { cantidad: Number(inv.cantidad) + Number(recurso.cantidad_llevada) },
          });
        } else {
          await tx.inventario_campamento.create({
            data: {
              id_campamento: exploracion.id_campamento,
              id_recurso: recurso.id_recurso,
              cantidad: recurso.cantidad_llevada,
              minimo_alerta: 0,
            },
          });
        }

        await tx.inventario_movimiento.create({
          data: {
            id_campamento: exploracion.id_campamento,
            id_recurso: recurso.id_recurso,
            fecha_hora: ahora,
            tipo: "TRASLADO_ENTRADA",
            origen: "EXPLORACION_CANCELADA",
            referencia: id_exploracion,
            cantidad: recurso.cantidad_llevada,
            id_usuario: idUsuario,
          },
        });
      }

      return tx.exploracion.update({ where: { id_exploracion }, data: updateData });
    });
  }

  return await prisma.exploracion.update({
    where: { id_exploracion },
    data: updateData,
  });
};

// ─── Asignar persona a exploración ───────────────────────────────────────────

export const asignarPersona = async (
  id_exploracion: number,
  datos: AsignarPersonaDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("Solo se pueden asignar personas a exploraciones en estado PLANIFICADA");
  }

  const persona = await prisma.persona.findUnique({
    where: { id_persona: datos.id_persona },
  });
  if (!persona) throw new Error("La persona no existe");
  if (!persona.activo) throw new Error("La persona no está activa");

  const yaAsignada = await prisma.exploracion_persona.findUnique({
    where: {
      id_exploracion_id_persona: {
        id_exploracion,
        id_persona: datos.id_persona,
      },
    },
  });

  if (yaAsignada) {
    throw new Error("La persona ya está asignada a esta exploración");
  }

  return await prisma.exploracion_persona.create({
    data: {
      id_exploracion,
      id_persona: datos.id_persona,
      rol_en_mision: datos.rol_en_mision ?? "EXPLORADOR",
    },
  });
};

// ─── Quitar persona de exploración ───────────────────────────────────────────

export const quitarPersona = async (
  id_exploracion: number,
  id_persona: number
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("No se pueden modificar personas en una exploración que ya inició");
  }

  const asignacion = await prisma.exploracion_persona.findUnique({
    where: {
      id_exploracion_id_persona: { id_exploracion, id_persona },
    },
  });

  if (!asignacion) {
    throw new Error("La persona no está asignada a esta exploración");
  }

  return await prisma.exploracion_persona.delete({
    where: {
      id_exploracion_id_persona: { id_exploracion, id_persona },
    },
  });
};

// ─── Agregar recurso a llevar ─────────────────────────────────────────────────

export const agregarRecursoLlevado = async (
  id_exploracion: number,
  datos: AgregarRecursoLlevadoDto
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "PLANIFICADA") {
    throw new Error("Solo se pueden agregar recursos a exploraciones en estado PLANIFICADA");
  }

  const inventario = await prisma.inventario_campamento.findUnique({
    where: {
      id_campamento_id_recurso: {
        id_campamento: exploracion.id_campamento,
        id_recurso: datos.id_recurso,
      },
    },
  });

  if (!inventario || Number(inventario.cantidad) < datos.cantidad_llevada) {
    throw new Error("Stock insuficiente para llevar ese recurso en la exploración");
  }

  return await prisma.exploracion_recurso_llevado.create({
    data: {
      id_exploracion,
      id_recurso: datos.id_recurso,
      cantidad_llevada: datos.cantidad_llevada,
    },
  });
};

// ─── Eliminar exploración ─────────────────────────────────────────────────────

export const eliminarExploracion = async (id_exploracion: number) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado === "EN_PROGRESO") {
    throw new Error("No se puede eliminar una exploración en progreso");
  }

  await prisma.exploracion_persona.deleteMany({ where: { id_exploracion } });
  await prisma.exploracion_recurso_llevado.deleteMany({ where: { id_exploracion } });
  await prisma.exploracion_recurso_encontrado.deleteMany({ where: { id_exploracion } });

  await prisma.exploracion.delete({ where: { id_exploracion } });
};

// ─── Registrar recursos encontrados al retorno ────────────────────────────────

export const registrarRecursoEncontrado = async (
  id_exploracion: number,
  datos: RegistrarRecursoEncontradoDto,
  idUsuario: number
) => {
  const exploracion = await prisma.exploracion.findUnique({
    where: { id_exploracion },
  });

  if (!exploracion) {
    throw new Error("Exploración no encontrada");
  }

  if (exploracion.estado !== "EN_PROGRESO" && exploracion.estado !== "COMPLETADA") {
    throw new Error(
      "Solo se pueden registrar recursos encontrados en exploraciones EN_PROGRESO o COMPLETADAS"
    );
  }

  return prisma.$transaction(async (tx) => {
    const recursoEncontrado = await tx.exploracion_recurso_encontrado.create({
      data: {
        id_exploracion,
        id_recurso: datos.id_recurso,
        cantidad_encontrada: datos.cantidad_encontrada,
        generado_aleatorio: datos.generado_aleatorio ?? false,
      },
    });

    // Agregar los recursos encontrados al inventario del campamento
    const inv = await tx.inventario_campamento.findUnique({
      where: {
        id_campamento_id_recurso: {
          id_campamento: exploracion.id_campamento,
          id_recurso: datos.id_recurso,
        },
      },
    });

    if (inv) {
      await tx.inventario_campamento.update({
        where: {
          id_campamento_id_recurso: {
            id_campamento: exploracion.id_campamento,
            id_recurso: datos.id_recurso,
          },
        },
        data: { cantidad: Number(inv.cantidad) + datos.cantidad_encontrada },
      });
    } else {
      await tx.inventario_campamento.create({
        data: {
          id_campamento: exploracion.id_campamento,
          id_recurso: datos.id_recurso,
          cantidad: datos.cantidad_encontrada,
          minimo_alerta: 0,
        },
      });
    }

    await tx.inventario_movimiento.create({
      data: {
        id_campamento: exploracion.id_campamento,
        id_recurso: datos.id_recurso,
        fecha_hora: new Date(),
        tipo: "TRASLADO_ENTRADA",
        origen: "EXPLORACION",
        referencia: id_exploracion,
        cantidad: datos.cantidad_encontrada,
        id_usuario: idUsuario,
      },
    });

    return recursoEncontrado;
  });
};
