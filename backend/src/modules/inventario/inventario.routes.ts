import { Router } from "express";
import {
  createResource,
  deleteResource,
  getAvailableResources,
  getResources,
  updateResource,
} from "./inventario.controller";
import { createProduccion, createRacion, recalculate } from "./inventario.controller";

const router = Router();

router.get("/resources", getResources);
router.get("/recursos", getAvailableResources);
router.post("/resources", createResource);
router.put("/resources/:campId/:resourceId", updateResource);
router.delete("/resources/:campId/:resourceId", deleteResource);
router.post("/produccion", createProduccion);
router.post("/racion", createRacion);
router.post("/recalculate/:campId", recalculate);

export default router;