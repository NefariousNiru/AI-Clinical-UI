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
import AccountActivationPage from "./pages/auth/AccountActivationPage.tsx";
import EnrollmentActivationPage from "./pages/auth/EnrollmentActivationPage.tsx";
import {ADMIN, AUTH, BASE_AUTO, STUDENT} from "./routes.ts";
import StudentLayout from "./pages/student/StudentLayout.tsx";


const router = createBrowserRouter([
    // Decide Home Based on Auth
    {path: BASE_AUTO, element: <AutoHome/>},

    //  Auth Route
    {
        path: AUTH,
        children: [
            {
                path: "activate",
                children: [
                    {path: "account", element: <AccountActivationPage/>},
                    {path: "enrollment", element: <EnrollmentActivationPage/>},
                ],
            },
            {path: "login", element: <LoginPage/>}, // optional
        ],
    },

    // Admin routes -> Require auth. Re-routes if not admin
    {
        path: ADMIN,
        element: (
            <RequireAuth allowedRoles={["admin"]}>
                <AdminLayout/>
            </RequireAuth>
        ),
        children: [
            {index: true, element: <Navigate to="tests" replace/>},
            {path: "week", element: <WeeksPage/>},
            {path: "rubric", element: <RubricPage/>},
            {path: "students", element: <StudentsPage/>},
            {path: "tests", element: <TestsPage/>},
            {path: "statistics", element: <StatisticsPage/>},
        ]
    },

    // Student routes -> Require auth. Re-routes if not admin
    {
      path: STUDENT,
      element: (
        <RequireAuth allowedRoles={["student"]}>
          <StudentLayout />
        </RequireAuth>
      ),
    },

    {path: "*", element: <Navigate to="/" replace/>},
]);

export default function App() {
    return (
        <div className="min-h-screen app-bg text-primary">
            <SkipLink/>
            <RouterProvider router={router}/>
        </div>
    );
}
