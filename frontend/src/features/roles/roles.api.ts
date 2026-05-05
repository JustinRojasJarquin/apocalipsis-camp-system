import { storage } from "../../shared/utils/storage";

const BASE_URL = "http://localhost:4000/api/roles";

const getHeaders = () => {
  const token = storage.getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  const body = await res.text();
  const data = body ? JSON.parse(body) : null;

  if (!res.ok) {
    throw new Error(data?.mensaje || data?.error || "Error en la petición");
  }

  return data as T;
};

export interface Rol {
  id_rol: number;
  nombre: string;
  codigo: string;
}

export const getRoles = async (): Promise<Rol[]> => {
  const res = await fetch(BASE_URL, {
    headers: getHeaders(),
  });

  return handleResponse<Rol[]>(res);
};

export const createRol = async (data: {
  nombre: string;
  codigo: string;
}): Promise<Rol> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Rol>(res);
};

export const updateRol = async (
  id: number,
  data: {
    nombre?: string;
    codigo?: string;
  },
): Promise<Rol> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Rol>(res);
};

export const changeUserRole = async (
  idUsuario: number,
  idRol: number,
): Promise<any> => {
  const res = await fetch(`${BASE_URL}/usuarios/${idUsuario}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ id_rol: idRol }),
  });

  return handleResponse<any>(res);
};