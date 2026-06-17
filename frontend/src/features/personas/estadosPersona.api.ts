import type { EstadoPersonaFormData, PersonaEstado } from "./types";

const BASE_URL = "http://localhost:4000/api/estados-persona";

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

const mapPayload = (data: EstadoPersonaFormData) => ({
  nombre: data.nombre.trim(),
  descripcion: data.descripcion.trim() || null,
  disponible: data.disponible,
});

export const getEstadosPersonaCatalogo = async (): Promise<PersonaEstado[]> => {
  const res = await fetch(BASE_URL);
  return await handleResponse<PersonaEstado[]>(res);
};

export const createEstadoPersona = async (data: EstadoPersonaFormData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<PersonaEstado>(res);
};

export const updateEstadoPersona = async (
  id: number,
  data: EstadoPersonaFormData,
) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<PersonaEstado>(res);
};

export const deleteEstadoPersona = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  return await handleResponse<PersonaEstado>(res);
};
