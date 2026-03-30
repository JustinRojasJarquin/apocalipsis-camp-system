import type { Campamento } from "./types";

const BASE_URL = "http://localhost:4000/api/campamentos";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || "Error en la petición");
  }

  const body = await res.text();
  return body ? JSON.parse(body) : null;
};

export const getCampamentos = async (): Promise<Campamento[]> => {
  const res = await fetch(BASE_URL);
  return (await handleResponse(res)) as Campamento[];
};

export const createCampamento = async (data: Campamento) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await handleResponse(res);
};

export const updateCampamento = async (id: number, data: Campamento) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await handleResponse(res);
};

export const deleteCampamento = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse(res);
};
