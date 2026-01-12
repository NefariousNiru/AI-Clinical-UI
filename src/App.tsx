// file: src/App.tsx

import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
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
import {
	ADMIN,
	ADMIN_RUBRIC,
	ADMIN_STATISTICS,
	ADMIN_STUDENTS,
	ADMIN_TESTS,
	ADMIN_WEEK,
	AUTH,
	AUTH_ACTIVATE,
	AUTH_ACTIVATE_ACCOUNT,
	AUTH_ACTIVATE_ENROLLMENT,
	AUTH_INTRO,
	AUTH_LOGIN,
	BASE_AUTO,
	STUDENT,
	STUDENT_WORKUP,
} from "./routes.ts";
import StudentLayout from "./pages/student/StudentLayout.tsx";
import ProductInfo from "./pages/auth/ProductInfo.tsx";
import WeeklyWorkupList from "./pages/student/WeeklyWorkupList.tsx";
import WeeklyWorkup from "./pages/student/submission/WeeklyWorkup.tsx";
import { Role } from "./lib/types/user.ts";

const router = createBrowserRouter([
	// Decide Home Based on Auth
	{ path: BASE_AUTO, element: <AutoHome /> },

	//  Public and Auth Route
	{
		path: AUTH,
		children: [
			{
				path: AUTH_ACTIVATE,
				children: [
					{ path: AUTH_ACTIVATE_ACCOUNT, element: <AccountActivationPage /> },
					{ path: AUTH_ACTIVATE_ENROLLMENT, element: <EnrollmentActivationPage /> },
				],
			},
			{ path: AUTH_INTRO, element: <ProductInfo /> },
			{ path: AUTH_LOGIN, element: <LoginPage /> },
		],
	},

	// Admin routes -> Require auth. Re-routes if not admin
	{
		path: ADMIN,
		element: (
			<RequireAuth allowedRoles={[Role.enum.admin]}>
				<AdminLayout />
			</RequireAuth>
		),
		children: [
			{ index: true, element: <Navigate to={ADMIN_TESTS} replace /> },
			{ path: ADMIN_WEEK, element: <WeeksPage /> },
			{ path: ADMIN_RUBRIC, element: <RubricPage /> },
			{ path: ADMIN_STUDENTS, element: <StudentsPage /> },
			{ path: ADMIN_TESTS, element: <TestsPage /> },
			{ path: ADMIN_STATISTICS, element: <StatisticsPage /> },
		],
	},

	// Student routes -> Require auth. Re-routes if not student (or not allowedRoles)
	{
		path: STUDENT,
		element: (
			<RequireAuth allowedRoles={[Role.enum.student]}>
				<StudentLayout />
			</RequireAuth>
		),
		children: [
			{ index: true, element: <WeeklyWorkupList /> },
			{ path: STUDENT_WORKUP, element: <WeeklyWorkup /> },
		],
	},

	{ path: "*", element: <Navigate to={BASE_AUTO} replace /> },
]);

export default function App() {
	return (
		<div className="min-h-screen app-bg text-primary">
			<SkipLink />
			<RouterProvider router={router} />
		</div>
	);
}
