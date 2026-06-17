import type { UsuarioAuth } from "../../types/auth";

interface TokenPayload {
  exp?: number;
}

const TOKEN_KEY = "token";
const TOKEN_EXPIRES_AT_KEY = "token_expires_at";
const USUARIO_KEY = "usuario";

const decodeTokenPayload = (token: string): TokenPayload | null => {
  const payload = token.split(".")[1];

  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
};

const getTokenExpiresAt = (token: string): number | null => {
  const exp = decodeTokenPayload(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
};

export const storage = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);

    const expiresAt = getTokenExpiresAt(token);
    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
    }
  },

  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token || storage.isTokenExpired()) {
      storage.clearAuth();
      return null;
    }

    return token;
  },

  isTokenExpired: (): boolean => {
    const storedExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt =
      Number(storedExpiresAt) || (token ? getTokenExpiresAt(token) : null);

    if (!expiresAt) return false;

    return Date.now() >= expiresAt;
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  },

  setUsuario: (usuario: UsuarioAuth) =>
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario)),

  getUsuario: (): UsuarioAuth | null => {
    if (storage.isTokenExpired()) {
      storage.clearAuth();
      return null;
    }

    const data = localStorage.getItem(USUARIO_KEY);
    return data ? (JSON.parse(data) as UsuarioAuth) : null;
  },

  removeUsuario: () => localStorage.removeItem(USUARIO_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(USUARIO_KEY);
  },
};
