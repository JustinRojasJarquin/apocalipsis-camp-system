import type { ReactNode } from "react";

interface ToastProviderProps {
  children: ReactNode;
}

function ToastProvider({ children }: ToastProviderProps) {
  return <>{children}</>;
}

export default ToastProvider;