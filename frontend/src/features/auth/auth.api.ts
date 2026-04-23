const API_URL = "http://localhost:4000/api/auth";

interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: {
    id_usuario: number;
    usuario: string;
    id_rol: number;
  };
}

export const loginRequest = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.mensaje || "Error al iniciar sesión");
  }

  return result;
};