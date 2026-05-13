import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { storage } from "../../shared/utils/storage";

interface Props {
  children: ReactNode;
  roles: string[];
}

function RoleRoute({ children, roles }: Props) {
  const usuario = storage.getUsuario();
  const rolCodigo = usuario?.rol?.codigo;

  if (!rolCodigo) {
    return <Navigate to="/" replace />;
  }

  if (!roles.includes(rolCodigo)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default RoleRoute;