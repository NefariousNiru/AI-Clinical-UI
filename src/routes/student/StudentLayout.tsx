// src/routes/student/StudentLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../services/authApi";
import StudentHome from "./StudentHome";

export default function StudentLayout() {
  const nav = useNavigate();

  async function handleLogout() {
    await logout();
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="h-14 border-b flex items-center gap-3 px-4">
        <div className="font-semibold flex-1">AI Clinical Student</div>
        <button
          onClick={handleLogout}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50"
        >
          Logout
        </button>
      </header>

      <main className="py-6 px-4 lg:px-6">
        <Outlet />
        <StudentHome />
      </main>
    </div>
  );
}
