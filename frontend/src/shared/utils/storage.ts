import type { UsuarioAuth } from "../../types/auth";

export const storage = {
  setToken: (token: string) => localStorage.setItem("token", token),

  getToken: (): string | null => localStorage.getItem("token"),

  removeToken: () => localStorage.removeItem("token"),

  setUsuario: (usuario: UsuarioAuth) =>
    localStorage.setItem("usuario", JSON.stringify(usuario)),

  getUsuario: (): UsuarioAuth | null => {
    const data = localStorage.getItem("usuario");
    return data ? (JSON.parse(data) as UsuarioAuth) : null;
  },

  removeUsuario: () => localStorage.removeItem("usuario"),

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },
};