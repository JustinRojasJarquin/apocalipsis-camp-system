import { Request, Response } from "express";
import * as service from "./cargos.service";

const getErrorStatus = (message: string) => {
  if (message.toLowerCase().includes("no existe")) {
    return 404;
  }

  if (message.toLowerCase().includes("asignadas")) {
    return 409;
  }

  return 400;
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await service.getCargos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await service.getCargoById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await service.createCargo(req.body);
    res.status(201).json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await service.updateCargo(Number(req.params.id), req.body);
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const data = await service.deleteCargo(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};
