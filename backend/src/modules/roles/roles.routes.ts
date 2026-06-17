import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import { requireRoleCodes } from "../../middlewares/role.middleware";
import * as controller from "./roles.controller";

const router = Router();

router.use(verificarToken);

router.get("/", controller.listarRoles);

router.post("/", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.crearRol);

router.put("/:id", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.actualizarRol);

router.patch(
  "/usuarios/:idUsuario",
  requireRoleCodes(["ADMIN", "ADMINISTRADOR"]),
  controller.cambiarRolUsuario,
);

export default router;
