import { Request, Response } from "express";
import * as service from "./usuarios.service";

export const listarRoles = async (_req: Request, res: Response) => {
  try {
    res.json(await service.listarRoles());
  } catch (error) {
    res.status(500).json({ mensaje: (error as Error).message });
  }
};

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

export const cambiarRol = async (req: Request, res: Response) => {
  try {
    res.json(
      await service.cambiarRol(
        Number(req.params.id),
        Number(req.body.id_rol)
      )
    );
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};