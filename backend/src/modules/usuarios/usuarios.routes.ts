import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as controller from "./usuarios.controller";

const router = Router();

router.use(verificarToken);

router.get("/", requireRole([1]), controller.listarUsuarios);
router.post("/", requireRole([1]), controller.crearUsuario);
router.patch("/:id/estado", requireRole([1]), controller.cambiarEstadoUsuario);

export default router;