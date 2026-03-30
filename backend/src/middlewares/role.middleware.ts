import { Request, Response, NextFunction } from "express";

export const requireRole = (rolesPermitidos: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    if (!rolesPermitidos.includes(usuario.id_rol)) {
      return res.status(403).json({
        mensaje: "No tienes permisos para acceder a este recurso",
      });
    }

    next();
  };
};