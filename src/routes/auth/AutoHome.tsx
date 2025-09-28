// src/routes/auth/AutoHome.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../../services/authApi";

export default function AutoHome() {
  const nav = useNavigate();
  useEffect(() => {
    let alive = true;
    me()
      .then(
        (u) =>
          alive &&
          nav(u.role === "admin" ? "/admin" : "/student", { replace: true })
      )
      .catch(() => alive && nav("/login", { replace: true }));
    return () => {
      alive = false;
    };
  }, [nav]);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

      {/* Message */}
      <p className="mt-4 text-sm font-medium">Redirecting to your dashboard…</p>
    </main>
  );
}
