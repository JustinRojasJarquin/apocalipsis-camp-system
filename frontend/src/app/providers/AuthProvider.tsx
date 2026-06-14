import { useEffect } from "react";
import type { ReactNode } from "react";
import { storage } from "../../shared/utils/storage";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const cerrarSesion = () => {
      storage.clearAuth();
      window.location.assign("/");
    };

    // Verificar expiración del JWT cada 30 segundos
    const intervalId = window.setInterval(() => {
      if (storage.isTokenExpired()) cerrarSesion();
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return <>{children}</>;
}

export default AuthProvider;
