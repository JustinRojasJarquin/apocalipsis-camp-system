import type { CreateRecursoFormData, RecursoItem } from "./types";

const BASE_URL = "http://localhost:4000/api/recursos";

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

export const getRecursos = async (): Promise<RecursoItem[]> => {
  const res = await fetch(BASE_URL);
  return await handleResponse<RecursoItem[]>(res);
};

export const createRecurso = async (
  payload: CreateRecursoFormData,
): Promise<RecursoItem> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await handleResponse<RecursoItem>(res);
};

export const updateRecurso = async (
  id: number,
  payload: CreateRecursoFormData,
): Promise<RecursoItem> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await handleResponse<RecursoItem>(res);
};

export const deleteRecurso = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(res);
};
