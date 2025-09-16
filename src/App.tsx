import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import AdminLayout from "./routes/admin/AdminLayout"
import Dashboard from "./routes/admin/Dashboard"

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ index: true, element: <Dashboard /> }],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
