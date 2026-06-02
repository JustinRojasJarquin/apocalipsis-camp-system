import {prisma} from '../../config/prisma';

import { CambiarEstadoFisicoDTO }
from '../estado_persona/estado-fisico.types';

import {
  calcularNivelRiesgo
} from './riesgo.service';

import {
  generarExplicacionEstado
} from './openrouter.service';

export async function cambiarEstadoFisico(
  data: CambiarEstadoFisicoDTO
) {

  await prisma.historial_estado_fisico_persona.updateMany({
    where: {
      id_persona: data.idPersona,
      fecha_fin: null
    },
    data: {
      fecha_fin: new Date()
    }
  });

  await prisma.persona.update({
    where: {
      id_persona: data.idPersona
    },
    data: {
      id_estado_fisico: data.idEstadoFisico
    }
  });

  await prisma.historial_estado_fisico_persona.create({
    data: {
      id_persona: data.idPersona,
      id_estado_fisico: data.idEstadoFisico,
      observacion: data.observacion,
      sugerido_por_ia:
        data.sugeridoPorIA || false
    }
  });

  const persona = await prisma.persona.findUnique({
    where: {
      id_persona: data.idPersona
    },

    include: {
      estado_fisico_persona: true,
      cargo: true
    }
  });

  if (!persona) {
    throw new Error('Persona no encontrada');
  }

  const riesgo = calcularNivelRiesgo(
    persona.estado_fisico_persona?.nombre || 'SANO'
  );

  const explicacionIA =
    await generarExplicacionEstado({

      estado:
        persona.estado_fisico_persona?.nombre || 'SANO',

      cargo:
        persona.cargo?.nombre || 'SIN_CARGO'
    });

  return {
    riesgo,
    explicacionIA,
    persona
  };
}