import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="flex bg-[var(--bg)] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}