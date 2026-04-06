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

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET  /api/exploraciones?campamento=:id  → listar por campamento
router.get("/", listarExploracionesController);

// GET  /api/exploraciones/:id             → detalle completo
router.get("/:id", obtenerExploracionController);

// POST /api/exploraciones                 → crear exploración
router.post("/", crearExploracionController);

// PUT    /api/exploraciones/:id/estado    → cambiar estado
router.put("/:id/estado", actualizarEstadoController);

// DELETE /api/exploraciones/:id           → eliminar exploración
router.delete("/:id", eliminarExploracionController);

// POST /api/exploraciones/:id/personas                        → asignar persona
router.post("/:id/personas", asignarPersonaController);

// DELETE /api/exploraciones/:id/personas/:id_persona          → quitar persona
router.delete("/:id/personas/:id_persona", quitarPersonaController);

// POST /api/exploraciones/:id/recursos-llevados               → agregar recurso a llevar
router.post("/:id/recursos-llevados", agregarRecursoLlevadoController);

// POST /api/exploraciones/:id/recursos-encontrados            → registrar recursos al retorno
router.post("/:id/recursos-encontrados", registrarRecursoEncontradoController);

export default router;
