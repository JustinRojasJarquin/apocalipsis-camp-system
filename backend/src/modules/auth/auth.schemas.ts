import type { LoginDto } from "./auth.dto";

export const validateLogin = (data: LoginDto): string | null => {
  if (!data.usuario || !data.password) {
    return "Debe enviar usuario y password";
  }

  if (!data.usuario.trim() || !data.password.trim()) {
    return "Usuario y contraseña no pueden estar vacíos";
  }

  return null;
};