import { Request, Response } from 'express';

import {
  cambiarEstadoFisico
} from '../estado_persona/estado-fisico.service';

export async function cambiarEstadoFisicoController(
  req: Request,
  res: Response
) {

  try {

    const resultado =
      await cambiarEstadoFisico(req.body);

    return res.json({
      ok: true,
      data: resultado
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error cambiando estado físico'
    });
  }
}