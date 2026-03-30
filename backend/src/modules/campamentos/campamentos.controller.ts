import { Request, Response } from "express";
import * as service from "./campamentos.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.getCampamentos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await service.createCampamento(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.updateCampamento(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.deleteCampamento(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
