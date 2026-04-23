import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware";
import {
  listarExploracionesController,
  obtenerExploracionController,
  crearExploracionController,
  actualizarEstadoController,
  eliminarExploracionController,
  asignarPersonaController,
  quitarPersonaController,
  agregarRecursoLlevadoController,
  registrarRecursoEncontradoController,
} from "./exploraciones.controller";

const router = Router();

router.use(verificarToken);

router.get("/", listarExploracionesController);
router.get("/:id", obtenerExploracionController);
router.post("/", crearExploracionController);
router.put("/:id/estado", actualizarEstadoController);
router.delete("/:id", eliminarExploracionController);
router.post("/:id/personas", asignarPersonaController);
router.delete("/:id/personas/:id_persona", quitarPersonaController);
router.post("/:id/recursos-llevados", agregarRecursoLlevadoController);
router.post("/:id/recursos-encontrados", registrarRecursoEncontradoController);

export default router;
