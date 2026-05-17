import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import * as controller from "./envios.controller";

const router = Router();

router.use(verificarToken);

router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.patch("/:id/salida", controller.confirmarSalida);
router.patch("/:id/llegada", controller.confirmarLlegada);
router.patch("/:id/cancelar", controller.cancelar);

export default router;
