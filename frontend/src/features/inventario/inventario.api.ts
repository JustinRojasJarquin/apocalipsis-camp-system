import { apiClient } from "../../services/api.client";
import type {
  InventarioFormData,
  InventarioResource,
  RecursoOption,
  ProduccionFormData,
  RacionFormData,
  MovimientoRegistro,
} from "./types";

const BASE_INVENTARIO_URL = "/inventario";
const RESOURCE_CATALOG_URL = "/recursos";

export const getResources = async (
  campamentoId?: number,
): Promise<InventarioResource[]> => {
  const endpoint = campamentoId
    ? `${BASE_INVENTARIO_URL}/resources?campamento=${campamentoId}`
    : `${BASE_INVENTARIO_URL}/resources`;
  return await apiClient(endpoint);
};

export const createResource = async (
  data: InventarioFormData,
): Promise<InventarioResource> => {
  return await apiClient(`${BASE_INVENTARIO_URL}/resources`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateResource = async (
  campId: number,
  resourceId: number,
  data: Omit<InventarioFormData, "campId" | "resourceId">,
): Promise<InventarioResource> => {
  return await apiClient(`${BASE_INVENTARIO_URL}/resources/${campId}/${resourceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteResource = async (
  campId: number,
  resourceId: number,
): Promise<void> => {
  await apiClient(`${BASE_INVENTARIO_URL}/resources/${campId}/${resourceId}`, {
    method: "DELETE",
  });
};

export const getAvailableResources = async (): Promise<RecursoOption[]> => {
  return await apiClient(RESOURCE_CATALOG_URL);
};

export const createProduccion = async (
  data: ProduccionFormData,
): Promise<unknown> => {
  return await apiClient(`${BASE_INVENTARIO_URL}/produccion`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createRacion = async (
  data: RacionFormData,
): Promise<unknown> => {
  return await apiClient(`${BASE_INVENTARIO_URL}/racion`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const recalculateInventory = async (
  campId: number,
  date?: string,
): Promise<unknown> => {
  return await apiClient(`${BASE_INVENTARIO_URL}/recalculate/${campId}`, {
    method: "POST",
    body: JSON.stringify({ date }),
  });
};

export const getInventoryMovements = async (
  campamentoId?: number,
): Promise<MovimientoRegistro[]> => {
  const endpoint = campamentoId
    ? `${BASE_INVENTARIO_URL}/movimientos?campamento=${campamentoId}`
    : `${BASE_INVENTARIO_URL}/movimientos`;
  return await apiClient(endpoint);
};
