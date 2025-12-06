// file: src/App.tsx

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./pages/admin/AdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import AutoHome from "./pages/auth/AutoHome";
import RequireAuth from "./pages/auth/RequireAuth";
import TestsPage from "./pages/admin/tests/TestsPage";
import StudentsPage from "./pages/admin/students/StudentsPage";
import RubricPage from "./pages/admin/rubric/RubricPage";
import WeeksPage from "./pages/admin/weeks/WeeksPage";
import StatisticsPage from "./pages/admin/statistics/StatisticsPage";
import SkipLink from "./components/SkipLink";


const router = createBrowserRouter([
  // Decide Home Based on Auth
  { path: "/", element: <AutoHome /> },

  //  Auth Route
  { path: "/login", element: <LoginPage /> },

  // Admin routes -> Require auth re-routes if not admin
  {
    path: "/admin",
    element: (
      <RequireAuth allowedRoles={["admin"]}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="tests" replace /> },
      { path: "week", element: <WeeksPage /> },
      { path: "rubric", element: <RubricPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "tests", element: <TestsPage /> },
      { path: "statistics", element: <StatisticsPage /> },
    ]
  },
  // {
  //   path: "/student",
  //   element: (
  //     <RequireAuth allowedRoles={["student"]}>
  //       <StudentLayout />
  //     </RequireAuth>
  //   ),
  // },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <div className="min-h-screen app-bg text-primary">
      <SkipLink />
      <RouterProvider router={router} />
    </div>
  );
}
