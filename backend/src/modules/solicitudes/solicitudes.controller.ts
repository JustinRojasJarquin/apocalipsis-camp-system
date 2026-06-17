import { Request, Response } from "express";
import * as service from "./solicitudes.service";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Error inesperado";
};

export const crear = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const solicitud = await service.crearSolicitud(req.body, idUsuario);

    return res.status(201).json({
      mensaje: "Solicitud creada correctamente",
      data: solicitud,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: getErrorMessage(error) });
  }
};

export const listar = async (req: Request, res: Response) => {
  try {
    const idCampamento = req.query.id_campamento
      ? Number(req.query.id_campamento)
      : undefined;

    const estado = req.query.estado?.toString();

    const solicitudes = await service.listarSolicitudes({
      idCampamento,
      estado,
    });

    return res.json({
      mensaje: "Solicitudes obtenidas correctamente",
      data: solicitudes,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: getErrorMessage(error) });
  }
};

export const obtener = async (req: Request, res: Response) => {
  try {
    const idSolicitud = Number(req.params.id);

    if (Number.isNaN(idSolicitud)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const solicitud = await service.obtenerSolicitud(idSolicitud);

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    return res.json({
      mensaje: "Solicitud obtenida correctamente",
      data: solicitud,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: getErrorMessage(error) });
  }
};

export const responder = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const idSolicitud = Number(req.params.id);

    if (Number.isNaN(idSolicitud)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const solicitud = await service.responderSolicitud(
      idSolicitud,
      req.body,
      idUsuario,
    );

    return res.json({
      mensaje: "Solicitud procesada correctamente",
      data: solicitud,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: getErrorMessage(error) });
  }
};