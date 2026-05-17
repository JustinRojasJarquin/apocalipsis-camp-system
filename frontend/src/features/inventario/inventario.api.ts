import type {
  InventarioFormData,
  InventarioResource,
  RecursoOption,
} from "./types";

const BASE_URL = "http://localhost:4000/api/inventario/resources";
const RESOURCE_CATALOG_URL = "http://localhost:4000/api/recursos";

const handleResponse = async <T>(res: Response): Promise<T> => {
  const body = await res.text();
  const data = body ? (JSON.parse(body) as unknown) : null;

  if (!res.ok) {
    const errorData = data as
      | { error?: string; mensaje?: string; message?: string }
      | null;
    const message =
      errorData?.error ||
      errorData?.message ||
      errorData?.mensaje ||
      res.statusText ||
      "Error en la petición";

    throw new Error(message);
  }

  return data as T;
};

export const getResources = async (
  campamentoId?: number,
): Promise<InventarioResource[]> => {
  const url = new URL(BASE_URL);
  if (campamentoId) {
    url.searchParams.set("campamento", String(campamentoId));
  }

  const res = await fetch(url.toString());
  return await handleResponse<InventarioResource[]>(res);
};

export const createResource = async (
  data: InventarioFormData,
): Promise<InventarioResource> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await handleResponse<InventarioResource>(res);
};

export const updateResource = async (
  campId: number,
  resourceId: number,
  data: Omit<InventarioFormData, "campId" | "resourceId">,
): Promise<InventarioResource> => {
  const res = await fetch(`${BASE_URL}/${campId}/${resourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await handleResponse<InventarioResource>(res);
};

export const deleteResource = async (
  campId: number,
  resourceId: number,
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${campId}/${resourceId}`, {
    method: "DELETE",
  });
  await handleResponse<void>(res);
};

export const getAvailableResources = async (): Promise<RecursoOption[]> => {
  const res = await fetch(RESOURCE_CATALOG_URL);
  return await handleResponse<RecursoOption[]>(res);
};
