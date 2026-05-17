import { Request, Response } from "express";
import * as service from "./inventario.service";
import type {
  CreateInventarioCampamentoDTO,
  UpdateInventarioCampamentoDTO,
} from "./inventario.dto";
import type {
  CreateProduccionDiariaDTO,
  CreateRacionDiariaDTO,
} from "./inventario.dto";
import { recalculateInventoryForDate } from "./inventario.service";

export const getResources = async (req: Request, res: Response) => {
  try {
    const campId = req.query.campamento
      ? Number(req.query.campamento)
      : undefined;
    const data = await service.getAllResources(campId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo recursos" });
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateInventarioCampamentoDTO;
    const data = await service.createResource(payload);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAvailableResources = async (req: Request, res: Response) => {
  try {
    const data = await service.getAvailableResources();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo recursos disponibles" });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const campId = Number(req.params.campId);
    const resourceId = Number(req.params.resourceId);
    const payload = req.body as UpdateInventarioCampamentoDTO;
    const data = await service.updateResource(campId, resourceId, payload);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const campId = Number(req.params.campId);
    const resourceId = Number(req.params.resourceId);
    await service.deleteResource(campId, resourceId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createProduccion = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateProduccionDiariaDTO;
    const data = await service.createProduccion(payload);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createRacion = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateRacionDiariaDTO;
    const data = await service.createRacion(payload);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const recalculate = async (req: Request, res: Response) => {
  try {
    const campId = Number(req.params.campId);
    const date = req.body?.date as string | undefined;
    const data = await recalculateInventoryForDate(campId, date);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
