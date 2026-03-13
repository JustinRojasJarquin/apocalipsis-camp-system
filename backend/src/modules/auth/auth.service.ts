import { pool } from "../../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Consulta a la base de datos sobre los datos del usuario
export const login = async (usuario: string, password: string) => {
  const [rows]: any = await pool.query(
    "SELECT id_usuario, usuario, contrasena_hash, id_rol, activo FROM usuario WHERE usuario = ? LIMIT 1",
    [usuario]
  );

  const usuarioEncontrado = rows[0];

  if (!usuarioEncontrado) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuarioEncontrado.activo) {
    throw new Error("Usuario inactivo");
  }

  //Compara la contraseña enviada por el usuario con el hash de la D. Por seguridad se realiza de esta manera
  const passwordValido = await bcrypt.compare(
    password,
    usuarioEncontrado.contrasena_hash
  );

  if (!passwordValido) {
    throw new Error("Contraseña incorrecta");
  }

  const secreto = process.env.JWT_SECRET as string;
  const expiracion = process.env.JWT_EXPIRES as jwt.SignOptions["expiresIn"];

  const token = jwt.sign(
    {
      id_usuario: usuarioEncontrado.id_usuario,
      id_rol: usuarioEncontrado.id_rol,
      usuario: usuarioEncontrado.usuario,
    },
    secreto,
    {
      expiresIn: expiracion || "8h",
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