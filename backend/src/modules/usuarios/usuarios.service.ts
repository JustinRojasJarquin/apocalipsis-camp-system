import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";

const ADMIN_ROLE_CODES = ["ADMIN", "ADMINISTRADOR"];

const normalizeRoleCode = (codigo?: string | null) =>
  codigo?.trim().toUpperCase() ?? "";

const isAdminRole = (codigo?: string | null) =>
  ADMIN_ROLE_CODES.includes(normalizeRoleCode(codigo));

const validatePassword = (password: string) => {
  if (!password || password.length < 8) {
    throw new Error("La contraseña debe tener mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("La contraseña debe incluir al menos una mayúscula");
  }

  if (!/[0-9]/.test(password)) {
    throw new Error("La contraseña debe incluir al menos un número");
  }
};

const countActiveAdmins = async () => {
  return prisma.usuario.count({
    where: {
      activo: true,
      rol: { codigo: { in: ADMIN_ROLE_CODES } },
      persona: { activo: true },
    },
  });
};

const getUsuarioConRol = async (idUsuario: number) => {
  return prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    include: {
      rol: true,
      persona: true,
    },
  });
};

export const listarUsuarios = async () => {
  return prisma.usuario.findMany({
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
    orderBy: { id_usuario: "desc" },
  });
};

export const crearUsuario = async (data: {
  usuario: string;
  password: string;
  id_rol: number;
  id_persona: number;
}) => {
  const usuarioNormalizado = data.usuario?.trim().toLowerCase();

  if (!usuarioNormalizado?.endsWith("@gmail.com")) {
    throw new Error("El usuario debe ser un correo Gmail");
  }

  validatePassword(data.password);

  const persona = await prisma.persona.findUnique({
    where: { id_persona: Number(data.id_persona) },
    include: {
      cargo: true,
      campamento: true,
      estado_persona: true,
    },
  });

  if (!persona) {
    throw new Error("La persona seleccionada no existe");
  }

  if (!persona.activo) {
    throw new Error("No se puede crear usuario para una persona inactiva");
  }

  const rol = await prisma.rol.findUnique({
    where: { id_rol: Number(data.id_rol) },
  });

  if (!rol) {
    throw new Error("El rol seleccionado no existe");
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { usuario: usuarioNormalizado },
  });

  if (usuarioExistente) {
    throw new Error("Este correo ya tiene usuario registrado");
  }

  const personaConUsuario = await prisma.usuario.findFirst({
    where: {
      id_persona: Number(data.id_persona),
      activo: true,
    },
  });

  if (personaConUsuario) {
    throw new Error("Esta persona ya tiene un usuario activo");
  }

  const hash = await hashPassword(data.password);

  return prisma.usuario.create({
    data: {
      usuario: usuarioNormalizado,
      contrasena_hash: hash,
      id_rol: Number(data.id_rol),
      id_persona: Number(data.id_persona),
      activo: true,
    },
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

export const cambiarEstadoUsuario = async (
  idUsuario: number,
  activo: boolean,
  idUsuarioSolicitante: number,
) => {
  if (idUsuario === idUsuarioSolicitante && !activo) {
    throw new Error("No puedes desactivar tu propio usuario");
  }

  const usuario = await getUsuarioConRol(idUsuario);

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  if (!activo && isAdminRole(usuario.rol.codigo)) {
    const activeAdmins = await countActiveAdmins();

    if (activeAdmins <= 1) {
      throw new Error("Debe existir al menos un administrador activo");
    }
  }

  return prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: { activo },
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

export const restablecerPasswordUsuario = async (
  idUsuario: number,
  password: string,
) => {
  validatePassword(password);

  const usuario = await getUsuarioConRol(idUsuario);

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const hash = await hashPassword(password);

  return prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: { contrasena_hash: hash },
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
