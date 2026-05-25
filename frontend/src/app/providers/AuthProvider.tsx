import { useEffect } from "react";
import type { ReactNode } from "react";
import { storage } from "../../shared/utils/storage";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (storage.isTokenExpired()) {
        storage.clearAuth();
        window.location.assign("/");
      }
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return <>{children}</>;
}

export default AuthProvider;
