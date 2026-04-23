import { prisma } from "../../config/prisma";
import { comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";


export const login = async (usuario: string, password: string) => {
  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: {
      usuario,
    },
  });

  if (!usuarioEncontrado) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuarioEncontrado.activo) {
    throw new Error("Usuario inactivo");
  }

  const passwordValido = await comparePassword(
    password,
    usuarioEncontrado.contrasena_hash
  );

  if (!passwordValido) {
    throw new Error("Contraseña incorrecta");
  }

  const token = generateToken({
    id_usuario: usuarioEncontrado.id_usuario,
    id_rol: usuarioEncontrado.id_rol,
    usuario: usuarioEncontrado.usuario,
  });

  return {
    mensaje: "Login exitoso",
    token,
    usuario: {
      id_usuario: usuarioEncontrado.id_usuario,
      usuario: usuarioEncontrado.usuario,
      id_rol: usuarioEncontrado.id_rol,
    },
  };
};