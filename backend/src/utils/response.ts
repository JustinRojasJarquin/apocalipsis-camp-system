import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  mensaje = "Operación exitosa",
  status = 200
) => {
  return res.status(status).json({
    success: true,
    mensaje,
    data,
  });
};

export const errorResponse = (
  res: Response,
  mensaje = "Error interno del servidor",
  status = 500
) => {
  return res.status(status).json({
    success: false,
    mensaje,
  });
};