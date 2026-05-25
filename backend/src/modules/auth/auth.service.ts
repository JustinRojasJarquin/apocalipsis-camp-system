import { prisma } from "../../config/prisma";
import { comparePassword } from "../../utils/hash";
import { generateToken, JWT_EXPIRATION_SECONDS } from "../../utils/jwt";

export const login = async (usuario: string, password: string) => {
  const usuarioNormalizado = usuario.trim();

  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: { usuario: usuarioNormalizado },
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

  if (!usuarioEncontrado) {
    throw new Error("Credenciales incorrectas");
  }

  if (!usuarioEncontrado.activo) {
    throw new Error("Usuario inactivo");
  }

  if (!usuarioEncontrado.persona.activo) {
    throw new Error("La persona asociada a este usuario está inactiva");
  }

  const passwordValido = await comparePassword(
    password,
    usuarioEncontrado.contrasena_hash,
  );

  if (!passwordValido) {
    throw new Error("Credenciales incorrectas");
  }

  const token = generateToken({
    id_usuario: usuarioEncontrado.id_usuario,
    id_rol: usuarioEncontrado.id_rol,
    usuario: usuarioEncontrado.usuario,
    rol_codigo: usuarioEncontrado.rol.codigo,
    id_persona: usuarioEncontrado.id_persona,
    id_campamento: usuarioEncontrado.persona.id_campamento,
    id_cargo: usuarioEncontrado.persona.id_cargo_actual,
  });

  return {
    mensaje: "Login exitoso",
    token,
    expiresIn: JWT_EXPIRATION_SECONDS,
    usuario: {
      id_usuario: usuarioEncontrado.id_usuario,
      usuario: usuarioEncontrado.usuario,
      id_rol: usuarioEncontrado.id_rol,
      rol: usuarioEncontrado.rol,
      persona: {
        id_persona: usuarioEncontrado.persona.id_persona,
        nombre: usuarioEncontrado.persona.nombre,
        apellidos: usuarioEncontrado.persona.apellidos,
        cargo: usuarioEncontrado.persona.cargo,
        campamento: usuarioEncontrado.persona.campamento,
        estado: usuarioEncontrado.persona.estado_persona,
      },
    },
  };
};
