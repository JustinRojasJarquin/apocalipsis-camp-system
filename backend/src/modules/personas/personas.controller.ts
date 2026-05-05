import { Request, Response } from "express";
import * as service from "./personas.service";

const getErrorStatus = (message: string) => {
  if (message.toLowerCase().includes("no existe")) {
    return 404;
  }

  return 400;
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await service.getPersonas();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.getPersonaById(id);
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await service.createPersona(req.body);
    res.status(201).json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.updatePersona(id, req.body);
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.deletePersona(id);
    res.json(data);
  } catch (error) {
    const message = (error as Error).message;
    res.status(getErrorStatus(message)).json({ error: message });
  }
};
export const getCargos = async (_req: Request, res: Response) => {
  try {
    const data = await service.getCargos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getEstados = async (_req: Request, res: Response) => {
  try {
    const data = await service.getEstados();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};