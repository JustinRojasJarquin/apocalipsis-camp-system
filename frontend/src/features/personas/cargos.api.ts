import type { CargoFormData, PersonaCargo } from "./types";

const BASE_URL = "http://localhost:4000/api/cargos";

const handleResponse = async <T>(res: Response): Promise<T> => {
  const body = await res.text();
  const data = body ? (JSON.parse(body) as unknown) : null;

  if (!res.ok) {
    const errorData = data as { error?: string; mensaje?: string } | null;
    const message =
      errorData?.error ||
      errorData?.mensaje ||
      res.statusText ||
      "Error en la peticion";

    throw new Error(message);
  }

  return data as T;
};

const mapPayload = (data: CargoFormData) => ({
  nombre: data.nombre.trim(),
  descripcion: data.descripcion.trim() || null,
});

export const getCargosCatalogo = async (): Promise<PersonaCargo[]> => {
  const res = await fetch(BASE_URL);
  return await handleResponse<PersonaCargo[]>(res);
};

export const createCargo = async (data: CargoFormData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<PersonaCargo>(res);
};

export const updateCargo = async (id: number, data: CargoFormData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<PersonaCargo>(res);
};

export const deleteCargo = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  return await handleResponse<PersonaCargo>(res);
};
