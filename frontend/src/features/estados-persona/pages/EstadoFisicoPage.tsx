import { useState } from 'react';

import EstadoFisicoCard
from '../components/EstadoFisicoCard';

import IARecommendationPanel
from '../../personas/components/IARecommendationPanel';

import SimuladorEvento
from '../../personas/components/SimuladorEvento';

import {
  cambiarEstadoFisico,
} from '../estadoFisico.api';

export default function EstadoFisicoPage() {

  const [estado, setEstado] =
    useState('SANO');

  const [riesgo, setRiesgo] =
    useState(0);

  const [explicacionIA, setExplicacionIA] =
    useState(
      'La persona se encuentra apta para actividades.',
    );

  async function handleEvento(
    estadoId: number,
  ) {

    try {

      const response =
        await cambiarEstadoFisico({

          idPersona: 1,

          idEstadoFisico: estadoId,

          observacion:
            'Evento generado desde simulador',
        });

      const persona = response.data.persona as {
        estado_fisico_persona?: {
          nombre: string;
        };
      };

      setEstado(
        persona.estado_fisico_persona?.nombre ||
        'SANO',
      );

      setRiesgo(response.data.riesgo);

      setExplicacionIA(
        response.data.explicacionIA,
      );

    } catch (error) {

      console.error(error);
    }
  }

  return (

    <div
      className="
        min-h-screen
        bg-zinc-100
        p-8
      "
    >

      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-4xl font-bold">
          Gestión IA de Estado Físico
        </h1>

        <EstadoFisicoCard
          nombre="Carlos Mendoza"
          cargo="Explorador"
          estado={estado}
          riesgo={riesgo}
        />

        <IARecommendationPanel
          explicacionIA={explicacionIA}
        />

        <SimuladorEvento
          onEvento={handleEvento}
        />

      </div>

    </div>
  );
}