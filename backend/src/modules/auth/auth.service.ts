import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/*
  Servicio de autenticación.
  Aquí se realiza la lógica del login:
  1. Buscar usuario en la base de datos
  2. Verificar que esté activo
  3. Comparar contraseña con bcrypt
  4. Generar token JWT
*/
export const login = async (usuario: string, password: string) => {
  /*
    Busca un usuario por su nombre de usuario.
    Como en Prisma el campo "usuario" es unique,
    podemos usar findUnique.
  */
  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: {
      usuario: usuario,
    },
  });

  if (!usuarioEncontrado) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuarioEncontrado.activo) {
    throw new Error("Usuario inactivo");
  }

  /*
    Comparamos la contraseña que envía el cliente
    con el hash guardado en la base de datos.
  */
  const passwordValido = await bcrypt.compare(
    password,
    usuarioEncontrado.contrasena_hash
  );

  if (!passwordValido) {
    throw new Error("Contraseña incorrecta");
  }

  /*
    Generamos el token JWT para autenticación.
    Por ahora usamos 8 horas fijas para evitar
    problemas de tipos con TypeScript.
  */
  const token = jwt.sign(
    {
      id_usuario: usuarioEncontrado.id_usuario,
      id_rol: usuarioEncontrado.id_rol,
      usuario: usuarioEncontrado.usuario,
    },
    process.env.JWT_SECRET || "secreto",
    {
      expiresIn: "8h",
    }
  );

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