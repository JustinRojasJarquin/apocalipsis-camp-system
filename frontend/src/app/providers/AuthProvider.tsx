import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

export default AuthProvider;