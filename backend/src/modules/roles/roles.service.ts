import { prisma } from "../../config/prisma";

const ADMIN_ROLE_CODES = ["ADMIN", "ADMINISTRADOR"];

const normalizeRoleCode = (codigo?: string | null) =>
  codigo?.trim().toUpperCase() ?? "";

const isAdminRole = (codigo?: string | null) =>
  ADMIN_ROLE_CODES.includes(normalizeRoleCode(codigo));

const countActiveAdmins = async () => {
  return prisma.usuario.count({
    where: {
      activo: true,
      rol: { codigo: { in: ADMIN_ROLE_CODES } },
      persona: { activo: true },
    },
  });
};

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

export const cambiarRolUsuario = async (
  idUsuario: number,
  idRol: number,
  idUsuarioSolicitante: number,
) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    include: {
      rol: true,
      persona: true,
    },
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

  if (idUsuario === idUsuarioSolicitante && !isAdminRole(rol.codigo)) {
    throw new Error("No puedes quitarte tu propio rol administrador");
  }

  if (isAdminRole(usuario.rol.codigo) && !isAdminRole(rol.codigo)) {
    const activeAdmins = await countActiveAdmins();

    if (activeAdmins <= 1) {
      throw new Error("Debe existir al menos un administrador activo");
    }
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
