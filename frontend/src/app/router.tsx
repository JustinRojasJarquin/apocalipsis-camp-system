import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import CampamentosPage from "../features/campamentos/pages/CampamentosPage";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";

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
    ],
  },
]);

export default router;
