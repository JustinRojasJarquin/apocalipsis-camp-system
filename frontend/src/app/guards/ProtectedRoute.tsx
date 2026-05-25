import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { storage } from "../../shared/utils/storage";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = storage.getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
