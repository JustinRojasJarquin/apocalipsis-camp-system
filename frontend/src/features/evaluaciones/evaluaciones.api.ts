import type {
  CreateEvaluacionIngresoPayload,
  EvaluacionIngreso,
  UpdateEvaluacionDecisionPayload,
} from "./types";

const BASE_URL = "http://localhost:4000/api/evaluaciones-ingreso";

const handleResponse = async <T>(res: Response): Promise<T> => {
  const body = await res.text();
  const data = body ? (JSON.parse(body) as unknown) : null;

  if (!res.ok) {
    const errorData = data as { error?: string; mensaje?: string } | null;

    const message =
      errorData?.error ||
      errorData?.mensaje ||
      res.statusText ||
      "Error en la petición";

    throw new Error(message);
  }

  return data as T;
};

export const getEvaluaciones = async (): Promise<EvaluacionIngreso[]> => {
  const res = await fetch(BASE_URL);
  return await handleResponse<EvaluacionIngreso[]>(res);
};

export const createEvaluacionIngreso = async (
  payload: CreateEvaluacionIngresoPayload,
): Promise<EvaluacionIngreso> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await handleResponse<EvaluacionIngreso>(res);
};

export const updateEvaluacionDecision = async (
  id: number,
  payload: UpdateEvaluacionDecisionPayload,
): Promise<EvaluacionIngreso> => {
  const res = await fetch(`${BASE_URL}/${id}/decision`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await handleResponse<EvaluacionIngreso>(res);
};
