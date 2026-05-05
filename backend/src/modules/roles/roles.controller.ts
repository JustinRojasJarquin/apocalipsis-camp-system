import { Request, Response } from "express";
import * as service from "./roles.service";

export const listarRoles = async (_req: Request, res: Response) => {
  try {
    res.json(await service.listarRoles());
  } catch (error) {
    res.status(500).json({ mensaje: (error as Error).message });
  }
};

export const crearRol = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.crearRol(req.body));
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};

export const actualizarRol = async (req: Request, res: Response) => {
  try {
    res.json(
      await service.actualizarRol(Number(req.params.id), req.body),
    );
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};

export const cambiarRolUsuario = async (req: Request, res: Response) => {
  try {
    res.json(
      await service.cambiarRolUsuario(
        Number(req.params.idUsuario),
        Number(req.body.id_rol),
      ),
    );
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};