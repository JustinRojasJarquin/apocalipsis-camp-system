import { Router } from "express";
import * as controller from "./personas.controller";

const router = Router();

router.post("/recomendar-cargo-ia", controller.recomendarCargoIA);
router.get("/cargos", controller.getCargos);
router.get("/estados", controller.getEstados);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.post("/:id/asignar-cargo-ia", controller.assignCargoByIA);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;