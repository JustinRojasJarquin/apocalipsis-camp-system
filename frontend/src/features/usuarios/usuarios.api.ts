import { storage } from "../../shared/utils/storage";

const BASE_URL = "http://localhost:4000/api/usuarios";

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

export interface UsuarioSistema {
  id_usuario: number;
  usuario: string;
  id_rol: number;
  id_persona: number;
  activo: boolean;
  rol?: {
    id_rol: number;
    nombre: string;
    codigo: string;
  };
  persona?: {
    id_persona: number;
    nombre: string;
    apellidos: string;
    campamento?: {
      id_campamento: number;
      nombre: string;
    } | null;
    cargo?: {
      id_cargo: number;
      nombre: string;
    } | null;
    estado_persona?: {
      id_estado: number;
      nombre: string;
      disponible: boolean;
    } | null;
  };
}

export const getUsuarios = async (): Promise<UsuarioSistema[]> => {
  const res = await fetch(BASE_URL, {
    headers: getHeaders(),
  });

  return handleResponse<UsuarioSistema[]>(res);
};

export const createUsuario = async (data: {
  usuario: string;
  password: string;
  id_rol: number;
  id_persona: number;
}): Promise<UsuarioSistema> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<UsuarioSistema>(res);
};

export const changeUsuarioEstado = async (
  idUsuario: number,
  activo: boolean,
): Promise<UsuarioSistema> => {
  const res = await fetch(`${BASE_URL}/${idUsuario}/estado`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ activo }),
  });

  return handleResponse<UsuarioSistema>(res);
};

export const resetUsuarioPassword = async (
  idUsuario: number,
  password: string,
): Promise<UsuarioSistema> => {
  const res = await fetch(`${BASE_URL}/${idUsuario}/password`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });

  return handleResponse<UsuarioSistema>(res);
};
