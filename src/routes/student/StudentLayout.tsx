// src/routes/student/StudentLayout.tsx
import { Outlet } from "react-router-dom";
import StudentHome from "./StudentHome";
import Header from "../../components/Header";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header title="AI Clinical Student" showLogout />

      <main className="py-6 px-4 lg:px-6">
        <Outlet />
        <StudentHome />
      </main>
    </div>
  );
}
