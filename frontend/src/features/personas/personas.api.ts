import type {
  Persona,
  PersonaCargo,
  PersonaEstado,
  PersonaFilters,
  PersonaFormData,
  CargoIARecommendation,
} from "./types";

export const BASE_URL = "http://localhost:4000/api/personas";

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

const mapPayload = (data: PersonaFormData) => ({
  id_campamento: Number(data.id_campamento),
  cedula: data.cedula.trim(),
  nombre: data.nombre.trim(),
  apellidos: data.apellidos.trim(),
  fecha_nacimiento: data.fecha_nacimiento.trim() || null,
  foto_url: data.foto_url.trim() || null,
  imagen_carnet_url: data.imagen_carnet_url.trim() || null,
  codigo_campamento: data.codigo_campamento.trim() || null,
  id_cargo_actual: data.id_cargo_actual
    ? Number(data.id_cargo_actual)
    : null,
  id_estado_actual: data.id_estado_actual
    ? Number(data.id_estado_actual)
    : null,
});

const appendFilter = (
  params: URLSearchParams,
  key: string,
  value: string,
) => {
  const trimmed = value.trim();

  if (trimmed) {
    params.set(key, trimmed);
  }
};

export const getPersonas = async (
  filters?: Partial<PersonaFilters>,
): Promise<Persona[]> => {
  const params = new URLSearchParams();

  appendFilter(params, "buscar", filters?.buscar ?? "");
  appendFilter(params, "id_campamento", filters?.id_campamento ?? "");
  appendFilter(params, "id_cargo", filters?.id_cargo ?? "");
  appendFilter(params, "id_estado", filters?.id_estado ?? "");

  const query = params.toString();
  const res = await fetch(query ? `${BASE_URL}?${query}` : BASE_URL);
  return await handleResponse<Persona[]>(res);
};

export const getCargos = async (): Promise<PersonaCargo[]> => {
  const res = await fetch(`${BASE_URL}/cargos`);
  return await handleResponse<PersonaCargo[]>(res);
};

export const getEstados = async (): Promise<PersonaEstado[]> => {
  const res = await fetch(`${BASE_URL}/estados`);
  return await handleResponse<PersonaEstado[]>(res);
};

export const createPersona = async (data: PersonaFormData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<Persona>(res);
};

export const updatePersona = async (id: number, data: PersonaFormData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapPayload(data)),
  });

  return await handleResponse<Persona>(res);
};

export const deletePersona = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<Persona>(res);
};

export const getPersonaById = async (id: number): Promise<Persona> => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return await handleResponse<Persona>(res);
};

export const recomendarCargoIA = async (data: {
  persona: string;
  estado?: string;
  cargoActual?: string | null;
  campamento?: string;
}) => {
  const res = await fetch(`${BASE_URL}/recomendar-cargo-ia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await handleResponse<{
    recommendedCargoId: number;
    recommendedCargoName: string;
    reason: string;
  }>(res);
};

export const assignCargoByIA = async (
  id: number,
): Promise<CargoIARecommendation> => {
  const res = await fetch(`${BASE_URL}/${id}/asignar-cargo-ia`, {
    method: "POST",
  });
  return await handleResponse<CargoIARecommendation>(res);
};
