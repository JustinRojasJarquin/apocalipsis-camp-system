import { storage } from "../utils/storage";

export const useAuth = () => {
  const token = storage.getToken();
  const usuario = storage.getUsuario();

  const isAuthenticated = !!token;

  return {
    token,
    usuario,
    isAuthenticated,
  };
};