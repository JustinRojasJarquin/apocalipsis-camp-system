import { Request, Response } from "express";
import * as service from "./usuarios.service";

export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    res.json(await service.listarUsuarios());
  } catch (error) {
    res.status(500).json({ mensaje: (error as Error).message });
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.crearUsuario(req.body));
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};

export const cambiarEstadoUsuario = async (req: Request, res: Response) => {
  try {
    res.json(
      await service.cambiarEstadoUsuario(
        Number(req.params.id),
        Boolean(req.body.activo),
        Number(req.usuario?.id_usuario),
      ),
    );
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};

export const restablecerPasswordUsuario = async (
  req: Request,
  res: Response,
) => {
  try {
    res.json(
      await service.restablecerPasswordUsuario(
        Number(req.params.id),
        String(req.body.password ?? ""),
      ),
    );
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};
