import { Request, Response } from "express";
import * as service from "./recursos.service";
import type { CreateRecursoDTO, UpdateRecursoDTO } from "./recursos.dto";

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.getRecursos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.getRecursoById(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateRecursoDTO;
    const data = await service.createRecurso(payload);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body as UpdateRecursoDTO;
    const data = await service.updateRecurso(id, payload);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteRecurso(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const seed = async (_req: Request, res: Response) => {
  try {
    const created = await service.seedRecursos();
    res.json({ seeded: created });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
