import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { storage } from "../../shared/utils/storage";

interface PublicRouteProps {
  children: ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const token = storage.getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
