import { apiClient } from "../../services/api.client";
import type { Campamento, CampamentoFormData } from "./types";

export const getCampamentos = async (): Promise<Campamento[]> => {
  return await apiClient("/campamentos");
};

export const createCampamento = async (data: CampamentoFormData) => {
  return await apiClient("/campamentos", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCampamento = async (
  id: number,
  data: CampamentoFormData,
) => {
  return await apiClient(`/campamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteCampamento = async (id: number) => {
  await apiClient(`/campamentos/${id}`, {
    method: "DELETE",
  });
};

export const getSolicitudes = async () => {
  return await apiClient("/solicitudes");
};

export const crearSolicitud = async (data: unknown) => {
  return await apiClient("/solicitudes", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const responderSolicitud = async (id: number, data: unknown) => {
  return await apiClient(`/solicitudes/${id}/responder`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
