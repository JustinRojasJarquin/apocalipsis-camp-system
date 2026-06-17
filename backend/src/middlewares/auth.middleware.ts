import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

interface PayloadToken {
  id_usuario: number;
  id_rol: number;
  usuario: string;
  rol_codigo?: string;
  id_persona?: number;
  id_campamento?: number;
  id_cargo?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const decoded = verifyToken(token) as PayloadToken;

    req.usuario = decoded;

    next();
  } catch {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};
