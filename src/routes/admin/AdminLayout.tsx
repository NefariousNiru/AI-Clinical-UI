import { useState } from "react";
import { Outlet } from "react-router-dom";
import ScaffoldDrawer from "./ScaffoldDrawer";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="h-14 border-b flex items-center gap-3 px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open sessions"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="font-semibold">AI Clinical Admin</div>
      </header>

      <div className="py-6">
        <Outlet />
      </div>

      <ScaffoldDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
