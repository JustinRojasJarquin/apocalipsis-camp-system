import type {
  CambiarEstadoFisicoPayload,
  EstadoFisicoResponse,
  EstadoFisico,
} from "./types";

const BASE_URL =
  "http://localhost:4000/api/estados-persona";

const handleResponse = async <T>(
  res: Response,
): Promise<T> => {

  const body = await res.text();

  const data = body
    ? (JSON.parse(body) as unknown)
    : null;

  if (!res.ok) {

    const errorData = data as
      | {
          error?: string;
          mensaje?: string;
          message?: string;
        }
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

export const cambiarEstadoFisico = async (
  payload: CambiarEstadoFisicoPayload,
): Promise<EstadoFisicoResponse> => {

  const res = await fetch(
    `${BASE_URL}/cambiar-estado`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    },
  );

  return await handleResponse<EstadoFisicoResponse>(
    res,
  );
};

export const getEstadosFisicos = async (): Promise<
  EstadoFisico[]
> => {

  const res = await fetch(
    `${BASE_URL}`,
  );

  return await handleResponse<EstadoFisico[]>(
    res,
  );
};