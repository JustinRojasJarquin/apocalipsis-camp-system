import { apiClient } from "../../services/api.client";
import type { Envio } from "./types";

export const getEnviosByCampamento = async (
  idCampamento: number,
): Promise<Envio[]> => {
  const response = await apiClient(`/envios?id_campamento=${idCampamento}`);
  return response.data ?? response;
};

export const confirmarSalida = async (idEnvio: number): Promise<Envio> => {
  const response = await apiClient(`/envios/${idEnvio}/salida`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  return response.data ?? response;
};

export const confirmarLlegada = async (idEnvio: number): Promise<Envio> => {
  const response = await apiClient(`/envios/${idEnvio}/llegada`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  return response.data ?? response;
};

export const cancelarEnvio = async (idEnvio: number): Promise<Envio> => {
  const response = await apiClient(`/envios/${idEnvio}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  return response.data ?? response;
};
