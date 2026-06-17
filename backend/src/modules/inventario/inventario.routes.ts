import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import {
  createResource,
  deleteResource,
  getAvailableResources,
  getResources,
  updateResource,
  getProducciones,
  getRaciones,
  getInventoryMovements,
  createProduccion,
  createRacion,
  recalculate,
} from "./inventario.controller";

const router = Router();
router.use(verificarToken);

router.get("/resources", getResources);
router.get("/recursos", getAvailableResources);
router.post("/resources", createResource);
router.put("/resources/:campId/:resourceId", updateResource);
router.delete("/resources/:campId/:resourceId", deleteResource);
router.get("/produccion", getProducciones);
router.post("/produccion", createProduccion);
router.get("/racion", getRaciones);
router.post("/racion", createRacion);
router.get("/movimientos", getInventoryMovements);
router.post("/recalculate/:campId", recalculate);

export default router;