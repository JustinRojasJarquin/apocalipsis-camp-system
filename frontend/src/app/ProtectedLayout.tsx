import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar";

function ProtectedLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;
