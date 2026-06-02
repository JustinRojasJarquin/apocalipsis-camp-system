const API_URL = "http://localhost:4000/api/auth";

interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  expiresIn: number;
  usuario: {
    id_usuario: number;
    usuario: string;
    id_rol: number;
    rol?: {
      id_rol: number;
      nombre: string;
      codigo: string;
    };
    persona?: {
      id_persona: number;
      nombre: string;
      apellidos: string;
      cargo?: {
        id_cargo: number;
        nombre: string;
      } | null;
      campamento?: {
        id_campamento: number;
        nombre: string;
      } | null;
      estado?: {
        id_estado: number;
        nombre: string;
        disponible: boolean;
      } | null;
    };
  };
}

export const loginRequest = async (
  data: LoginRequest,
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
