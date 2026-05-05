import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import * as controller from "./roles.controller";

const router = Router();

router.use(verificarToken);

router.get("/", controller.listarRoles);

router.post("/", requireRole([1]), controller.crearRol);

router.put("/:id", requireRole([1]), controller.actualizarRol);

router.patch(
  "/usuarios/:idUsuario",
  requireRole([1]),
  controller.cambiarRolUsuario,
);

export default router;