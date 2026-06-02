import { Request, Response } from "express";
import {
  createEvaluacionIngreso,
  finalizeEvaluacionIngreso,
  getEvaluacionById,
  getEvaluaciones,
} from "./evaluacion-ingreso.service";

export const getEvaluacionesHandler = async (req: Request, res: Response) => {
  try {
    const evaluaciones = await getEvaluaciones();
    res.json(evaluaciones);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al obtener evaluaciones" });
  }
};

export const getEvaluacionByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const evaluacion = await getEvaluacionById(id);
    res.json(evaluacion);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al obtener la evaluación" });
  }
};

export const createEvaluacionIngresoHandler = async (req: Request, res: Response) => {
  try {
    const evaluacion = await createEvaluacionIngreso(req.body);
    res.status(201).json(evaluacion);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al crear la evaluación" });
  }
};

export const finalizeEvaluacionIngresoHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const evaluacion = await finalizeEvaluacionIngreso(id, req.body);
    res.json(evaluacion);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al actualizar la decisión" });
  }
};
