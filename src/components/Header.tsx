// src/components/Header.tsx
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authApi";

type HeaderProps = {
  title: string;
  left?: ReactNode; // optional left slot (e.g., menu button)
  right?: ReactNode; // optional extra actions
  showLogout?: boolean; // if true, renders Logout with built-in logic
  className?: string;
};

export default function Header({
  title,
  left,
  right,
  showLogout = false,
  className = "",
}: HeaderProps) {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      nav("/login", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <header
      className={`h-14 border-b bg-white text-gray-900 flex items-center gap-3 px-4 ${className}`}
    >
      {left ? <div className="shrink-0">{left}</div> : null}

      <div className="font-semibold">{title}</div>

      <div className="flex-1" />

      {right ? <div className="flex items-center gap-2">{right}</div> : null}

      {showLogout ? (
        <button
          onClick={handleLogout}
          disabled={busy}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50 disabled:opacity-50"
          aria-label="Logout"
        >
          {busy ? "Logging out..." : "Logout"}
        </button>
      ) : null}
    </header>
  );
}
