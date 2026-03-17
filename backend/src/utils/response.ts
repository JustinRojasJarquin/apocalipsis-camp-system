import { Response } from "express";

/**
 * Respuesta exitosa estándar
 */
export function successResponse(
  res: Response,
  data: any,
  message = "Operación exitosa",
  status = 200
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Respuesta de error estándar
 */
export function errorResponse(
  res: Response,
  message = "Error interno del servidor",
  status = 500
) {
  return res.status(status).json({
    success: false,
    message,
  });
}