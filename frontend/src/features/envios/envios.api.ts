import { apiClient } from "../../services/api.client";
import type { Envio, EnvioPayload, UpdateEnvioPayload } from "./types";

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

export const createEnvio = async (payload: EnvioPayload): Promise<Envio> => {
  const response = await apiClient("/envios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data ?? response;
};

export const updateEnvio = async (
  idEnvio: number,
  payload: UpdateEnvioPayload,
): Promise<Envio> => {
  const response = await apiClient(`/envios/${idEnvio}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data ?? response;
};

export const confirmarLlegada = async (
  idEnvio: number,
  payload: {
    recursos_recibidos?: Array<{
      id_envio_recurso: number;
      cantidad_recibida: number;
    }>;
  } = {},
): Promise<Envio> => {
  const response = await apiClient(`/envios/${idEnvio}/llegada`, {
    method: "PATCH",
    body: JSON.stringify(payload),
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

export const deleteEnvio = async (idEnvio: number): Promise<void> => {
  await apiClient(`/envios/${idEnvio}`, {
    method: "DELETE",
  });
};
