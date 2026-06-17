import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import { requireRoleCodes } from "../../middlewares/role.middleware";
import * as controller from "./usuarios.controller";

const router = Router();

router.use(verificarToken);

router.get("/", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.listarUsuarios);
router.post("/", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.crearUsuario);
router.patch("/:id/estado", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.cambiarEstadoUsuario);
router.patch("/:id/password", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.restablecerPasswordUsuario);

export default router;
