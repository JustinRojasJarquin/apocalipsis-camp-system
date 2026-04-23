import type { Campamento, CampamentoFormData } from "./types";

const BASE_URL = "http://localhost:4000/api/campamentos";

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

export const getCampamentos = async (): Promise<Campamento[]> => {
  const res = await fetch(BASE_URL);
  return await handleResponse<Campamento[]>(res);
};

export const createCampamento = async (data: CampamentoFormData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await handleResponse<Campamento>(res);
};

export const updateCampamento = async (
  id: number,
  data: CampamentoFormData,
) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await handleResponse<Campamento>(res);
};

export const deleteCampamento = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<Campamento>(res);
};
