import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import * as controller from "./solicitudes.controller";

const router = Router();

router.use(verificarToken);

router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.patch("/:id/responder", controller.responder);

export default router;