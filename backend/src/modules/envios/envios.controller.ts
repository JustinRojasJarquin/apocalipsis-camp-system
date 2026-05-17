import { Request, Response } from "express";
import * as service from "./envios.service";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

const getErrorStatus = (message: string) => {
  if (message.includes("no encontrado")) return 404;
  if (message.includes("no está en estado") || message.includes("Solo se pueden")) return 409;
  return 400;
};

export const listar = async (req: Request, res: Response) => {
  try {
    const idCampamento = req.query.id_campamento
      ? Number(req.query.id_campamento)
      : undefined;
    const estado = req.query.estado?.toString();

    const envios = await service.listarEnvios({ idCampamento, estado });
    return res.json({ mensaje: "Envíos obtenidos correctamente", data: envios });
  } catch (error) {
    return res.status(500).json({ mensaje: getErrorMessage(error) });
  }
};

export const obtener = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ mensaje: "ID inválido" });

    const envio = await service.obtenerEnvio(id);
    if (!envio) return res.status(404).json({ mensaje: "Envío no encontrado" });

    return res.json({ mensaje: "Envío obtenido correctamente", data: envio });
  } catch (error) {
    return res.status(500).json({ mensaje: getErrorMessage(error) });
  }
};

export const confirmarSalida = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    if (!idUsuario) return res.status(401).json({ mensaje: "Usuario no autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ mensaje: "ID inválido" });

    const envio = await service.confirmarSalida(id, req.body, idUsuario);
    return res.json({ mensaje: "Salida confirmada correctamente", data: envio });
  } catch (error) {
    const msg = getErrorMessage(error);
    return res.status(getErrorStatus(msg)).json({ mensaje: msg });
  }
};

export const confirmarLlegada = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    if (!idUsuario) return res.status(401).json({ mensaje: "Usuario no autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ mensaje: "ID inválido" });

    const envio = await service.confirmarLlegada(id, req.body, idUsuario);
    return res.json({ mensaje: "Llegada confirmada correctamente", data: envio });
  } catch (error) {
    const msg = getErrorMessage(error);
    return res.status(getErrorStatus(msg)).json({ mensaje: msg });
  }
};

export const cancelar = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    if (!idUsuario) return res.status(401).json({ mensaje: "Usuario no autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ mensaje: "ID inválido" });

    const envio = await service.cancelarEnvio(id, idUsuario);
    return res.json({ mensaje: "Envío cancelado correctamente", data: envio });
  } catch (error) {
    const msg = getErrorMessage(error);
    return res.status(getErrorStatus(msg)).json({ mensaje: msg });
  }
};
