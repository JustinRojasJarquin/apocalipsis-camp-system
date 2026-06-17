import { useState } from 'react';

import {
  useEstadoFisico
} from '../../estados-persona/useEstadoFisico';

export function CambiarEstadoModal() {

  const {
    actualizarEstado
  } = useEstadoFisico();

  const [estadoId, setEstadoId] =
    useState('');

  const [observacion, setObservacion] =
    useState('');

  async function handleSubmit() {

    await actualizarEstado({
      idPersona: 1,
      idEstadoFisico: Number(estadoId),
      observacion
    });
  }

  return (
    <div className="space-y-4">

      <select
        value={estadoId}
        onChange={(e) =>
          setEstadoId(e.target.value)
        }
      >
        <option value="">
          Seleccione
        </option>

        <option value="1">SANO</option>
        <option value="2">HERIDO</option>
        <option value="3">ENFERMO</option>
        <option value="4">INFECTADO</option>
        <option value="5">AGOTADO</option>
        <option value="6">EN_MISION</option>
        <option value="7">MUERTO</option>
      </select>

      <textarea
        placeholder="Observación"
        value={observacion}
        onChange={(e) =>
          setObservacion(e.target.value)
        }
      />

      <button
        onClick={handleSubmit}
      >
        Cambiar estado
      </button>

    </div>
  );
}