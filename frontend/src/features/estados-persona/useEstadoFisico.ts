import { useState } from "react";

import {
  cambiarEstadoFisico,
} from "../estados-persona/estadoFisico.api";

export function useEstadoFisico() {

  const [loading, setLoading] =
    useState(false);

  async function actualizarEstado(data: {
    idPersona: number;

    idEstadoFisico: number;

    observacion?: string;
  }) {

    try {

      setLoading(true);

      return await cambiarEstadoFisico(data);

    } finally {

      setLoading(false);
    }
  }

  return {
    loading,
    actualizarEstado,
  };
}