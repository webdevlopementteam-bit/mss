import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />

      <div className="ml-64 min-w-0 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6 lg:p-8 admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
