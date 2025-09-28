// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./routes/admin/AdminLayout";
import Dashboard from "./routes/admin/Dashboard";
import LoginPage from "./routes/auth/LoginPage";
import AutoHome from "./routes/auth/AutoHome";
import RequireAuth from "./routes/auth/RequireAuth";
import StudentLayout from "./routes/student/StudentLayout";

const router = createBrowserRouter([
  { path: "/", element: <AutoHome /> },
  { path: "/login", element: <LoginPage /> },

  {
    path: "/admin",
    element: (
      <RequireAuth allowedRoles={["admin"]}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: "/student",
    element: (
      <RequireAuth allowedRoles={["student", "admin"]}>
        <StudentLayout />
      </RequireAuth>
    ),
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
