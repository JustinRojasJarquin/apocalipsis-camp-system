import { Router } from "express";
import {
  createEvaluacionIngresoHandler,
  finalizeEvaluacionIngresoHandler,
  getEvaluacionByIdHandler,
  getEvaluacionesHandler,
} from "./evaluacion-ingreso.controller";

const router = Router();

router.get("/", getEvaluacionesHandler);
router.get("/:id", getEvaluacionByIdHandler);
router.post("/", createEvaluacionIngresoHandler);
router.put("/:id/decision", finalizeEvaluacionIngresoHandler);

export default router;
