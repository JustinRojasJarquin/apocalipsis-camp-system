import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error capturado:", error);

  return res.status(error.statusCode || 500).json({
    mensaje: error.message || "Error interno del servidor",
  });
};