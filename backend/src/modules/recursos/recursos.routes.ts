import { Router } from "express";
import * as controller from "./recursos.controller";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/seed", controller.seed);

export default router;
