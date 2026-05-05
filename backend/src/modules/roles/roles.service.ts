import { prisma } from "../../config/prisma";

export const listarRoles = async () => {
  return prisma.rol.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const crearRol = async (data: { nombre: string; codigo: string }) => {
  if (!data.nombre?.trim()) {
    throw new Error("El nombre del rol es obligatorio");
  }

  if (!data.codigo?.trim()) {
    throw new Error("El código del rol es obligatorio");
  }

  return prisma.rol.create({
    data: {
      nombre: data.nombre.trim(),
      codigo: data.codigo.trim().toUpperCase(),
    },
  });
};

export const actualizarRol = async (
  idRol: number,
  data: { nombre?: string; codigo?: string },
) => {
  const rol = await prisma.rol.findUnique({
    where: { id_rol: idRol },
  });

  if (!rol) {
    throw new Error("Rol no encontrado");
  }

  return prisma.rol.update({
    where: { id_rol: idRol },
    data: {
      nombre: data.nombre?.trim() || rol.nombre,
      codigo: data.codigo?.trim().toUpperCase() || rol.codigo,
    },
  });
};

export const cambiarRolUsuario = async (idUsuario: number, idRol: number) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const rol = await prisma.rol.findUnique({
    where: { id_rol: idRol },
  });

  if (!rol) {
    throw new Error("Rol no encontrado");
  }

  return prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: { id_rol: idRol },
    include: {
      rol: true,
      persona: {
        include: {
          cargo: true,
          campamento: true,
          estado_persona: true,
        },
      },
    },
  });
};