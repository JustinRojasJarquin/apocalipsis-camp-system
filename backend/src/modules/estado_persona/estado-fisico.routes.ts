import { Router } from 'express';

import {
  cambiarEstadoFisicoController
} from '../estado_persona/estado-fisico.controller';

const router = Router();

router.post(
  '/cambiar-estado',
  cambiarEstadoFisicoController
);

export default router;