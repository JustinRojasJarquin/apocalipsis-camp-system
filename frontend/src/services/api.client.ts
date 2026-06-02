import { storage } from "../shared/utils/storage";

const BASE_URL = "http://localhost:4000/api";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = storage.getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 401) {
    storage.clearAuth();
    window.location.assign("/");
  }

  if (!response.ok) {
    const message = data?.mensaje || data?.error || data?.message || "Error en la petición";
    const err: any = new Error(message);
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
};
