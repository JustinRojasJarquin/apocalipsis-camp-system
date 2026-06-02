import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import { requireRoleCodes } from "../../middlewares/role.middleware";
import * as controller from "./campamentos.controller";

const router = Router();

router.use(verificarToken);

router.get("/", controller.getAll);

router.post("/", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.create);

router.put("/:id", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.update);

router.delete("/:id", requireRoleCodes(["ADMIN", "ADMINISTRADOR"]), controller.remove);

export default router;
