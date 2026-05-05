import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

    if (!authHeader) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto",
    ) as PayloadToken;

    req.usuario = decoded;

    next();
  } catch {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};