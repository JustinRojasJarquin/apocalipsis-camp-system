import { apiClient } from "../../services/api.client";
import type { SolicitudCampamento } from "./types";

export const getSolicitudesByCampamento = async (
  idCampamento: number,
): Promise<SolicitudCampamento[]> => {
  const response = await apiClient(`/solicitudes?id_campamento=${idCampamento}`);
  return response.data ?? response;
};

export const createSolicitud = async (data: unknown) => {
  const response = await apiClient("/solicitudes", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data ?? response;
};

export const responderSolicitud = async (
  idSolicitud: number,
  data: unknown,
) => {
  const response = await apiClient(`/solicitudes/${idSolicitud}/responder`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return response.data ?? response;
};