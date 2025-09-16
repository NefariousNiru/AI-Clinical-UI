// src/routes/admin/AdminLayout.tsx
import { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import ScaffoldDrawer from "./ScaffoldDrawer";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // mock data until real sessions/histories are wired
  const sessions = useMemo(
    () => [
      { id: 1, title: "Session A", subtitle: "Prompt v12 • 2 outputs" },
      { id: 2, title: "Session B", subtitle: "Custom edits • 1 output" },
      { id: 3, title: "Session C", subtitle: "Baseline prompt" },
    ],
    []
  );
  const histories = useMemo(
    () => [
      { id: "h-1", title: "Today 13:22", subtitle: "Saved as new default" },
      { id: "h-2", title: "Yesterday 19:05", subtitle: "Reverted to default" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="h-14 border-b flex items-center gap-3 px-4">
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open sessions and history"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          {/* simple inline svg, no extra deps */}
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

      {/* main content full width */}
      <div className="py-6">
        <Outlet />
      </div>

      {/* Drawer */}
      <ScaffoldDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={sessions}
        histories={histories}
      />
    </div>
  );
}
