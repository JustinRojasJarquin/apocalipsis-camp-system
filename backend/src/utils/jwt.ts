import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

interface JwtPayload {
  id_usuario: number;
  id_rol: number;
  usuario: string;
  rol_codigo?: string;
  id_persona?: number;
  id_campamento?: number;
  id_cargo?: number | null;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || "secreto";

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: 60 * 60 * 8, // 8 horas en segundos
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}