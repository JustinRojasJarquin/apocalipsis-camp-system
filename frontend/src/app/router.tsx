import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ExploracionesPage from "../features/exploraciones/pages/ExploracionesPage";
import CampamentosPage from "../features/campamentos/pages/CampamentosPage";
import PersonasPage from "../features/personas/pages/PersonasPage";
import InventarioPage from "../features/inventario/InventarioPage";
import RecursosPage from "../features/recursos/RecursosPage";
import UsuariosPage from "../features/usuarios/pages/UsuariosPage";

import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import RoleRoute from "./guards/RoleRoute";

const ADMIN = ["ADMIN", "ADMINISTRADOR"];
const VIAJES = ["ADMIN", "ADMINISTRADOR", "VIAJES", "ENCARGADO_VIAJES"];
const TRABAJADOR = ["ADMIN", "ADMINISTRADOR", "GESTOR_RECURSOS", "TRABAJADOR"];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "campamentos",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={ADMIN}>
              <CampamentosPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "personas",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={ADMIN}>
              <PersonasPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={ADMIN}>
              <UsuariosPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "inventario",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={TRABAJADOR}>
              <InventarioPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "recursos",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={TRABAJADOR}>
              <RecursosPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "exploraciones",
        element: (
          <ProtectedRoute>
            <RoleRoute roles={VIAJES}>
              <ExploracionesPage />
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
