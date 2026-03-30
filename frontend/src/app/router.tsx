import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import CampamentosPage from "../features/campamentos/pages/CampamentosPage";
import PersonasPage from "../features/personas/pages/PersonasPage";
import InventarioPage from "../features/inventario/pages/InventarioPage";

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
            <CampamentosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "personas",
        element: (
          <ProtectedRoute>
            <PersonasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "inventario",
        element: (
          <ProtectedRoute>
            <InventarioPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
