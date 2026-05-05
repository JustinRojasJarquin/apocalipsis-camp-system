import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/hash";

export const listarRoles = async () => {
  return prisma.rol.findMany({
    orderBy: { nombre: "asc" },
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

export const crearUsuario = async (data: any) => {
  if (!data.usuario || !data.usuario.endsWith("@gmail.com")) {
    throw new Error("El usuario debe ser un correo Gmail");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const persona = await prisma.persona.findUnique({
    where: { id_persona: Number(data.id_persona) },
    include: {
      cargo: true,
      campamento: true,
    },
  });

  if (!persona) {
    throw new Error("La persona seleccionada no existe");
  }

  if (!persona.activo) {
    throw new Error("No se puede crear usuario para una persona inactiva");
  }

  if (!persona.id_cargo_actual) {
    throw new Error("La persona debe tener un cargo antes de crear usuario");
  }

  const usuarioExistentePersona = await prisma.usuario.findFirst({
    where: {
      id_persona: Number(data.id_persona),
      activo: true,
    },
  });

  if (usuarioExistentePersona) {
    throw new Error("Esta persona ya tiene un usuario activo");
  }

  const usuarioExistenteCorreo = await prisma.usuario.findUnique({
    where: { usuario: data.usuario },
  });

  if (usuarioExistenteCorreo) {
    throw new Error("Este correo ya está registrado");
  }

  const rol = await prisma.rol.findUnique({
    where: { id_rol: Number(data.id_rol) },
  });

  if (!rol) {
    throw new Error("El rol seleccionado no existe");
  }

  const hash = await hashPassword(data.password);

  return prisma.usuario.create({
    data: {
      usuario: data.usuario,
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

export const cambiarRol = async (idUsuario: number, idRol: number) => {
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
        },
      },
    },
  });
};