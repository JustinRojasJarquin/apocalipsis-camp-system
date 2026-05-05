import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";

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
  if (!data.usuario?.endsWith("@gmail.com")) {
    throw new Error("El usuario debe ser un correo Gmail");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("La contraseña debe tener mínimo 6 caracteres");
  }

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
    where: { usuario: data.usuario },
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
      usuario: data.usuario.trim(),
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
) => {
  return prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: { activo },
    include: {
      rol: true,
      persona: true,
    },
  });
};