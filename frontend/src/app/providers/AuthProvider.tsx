import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { storage } from "../../shared/utils/storage";

const INACTIVIDAD_MS = 20 * 60 * 1000; // 20 minutos

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cerrarSesion = () => {
      storage.clearAuth();
      window.location.assign("/");
    };

    const resetearTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!storage.getToken()) return;
      timeoutRef.current = setTimeout(cerrarSesion, INACTIVIDAD_MS);
    };

    const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    eventos.forEach((ev) => window.addEventListener(ev, resetearTimer));

    // Verificar expiración del JWT cada 30 segundos
    const intervalId = window.setInterval(() => {
      if (storage.isTokenExpired()) cerrarSesion();
    }, 30_000);

    // Iniciar el timer al cargar
    resetearTimer();

    return () => {
      eventos.forEach((ev) => window.removeEventListener(ev, resetearTimer));
      window.clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return <>{children}</>;
}

export default AuthProvider;
