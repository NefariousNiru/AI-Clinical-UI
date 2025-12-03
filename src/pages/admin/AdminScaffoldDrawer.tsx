// file: src/pages/admin/AdminScaffoldDrawer.tsx

import { useEffect, useRef } from "react";
import { X, Moon, SunMedium, Settings2 } from "lucide-react";
import { useTheme } from "../../providers/theme/useTheme";
import { AdminTabs } from "./AdminTabs";

type AdminScaffoldDrawerProps = {
  open: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
};

export function AdminScaffoldDrawer({
  open,
  onClose,
  onOpenSettings,
}: AdminScaffoldDrawerProps) {
  const { theme, toggleTheme } = useTheme();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus trap entry: focus close button when opened
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [open]);

  // ESC to close
  function handleKeyDown(ev: React.KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Escape") {
      ev.stopPropagation();
      onClose();
    }
  }

  if (!open) return null;

  const themeLabel = theme === "light" ? "Dark mode" : "Light mode";

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop (non-focusable) */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer as modal dialog */}
      <div
        id="admin-drawer"
        className="absolute inset-y-0 right-0 w-72 bg-surface border-l border-subtle shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        onKeyDown={handleKeyDown}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
          <div
            id="admin-drawer-title"
            className="text-sm font-semibold text-primary"
          >
            AI Clinical Admin
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-subtle hover:bg-surface transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div>
            <div className="text-xs font-medium text-muted">Navigation</div>

            {/* Tab list */}
            <div className="mt-2">
              <AdminTabs variant="drawer" onNavigate={onClose} />
            </div>

            {/* Soft divider */}
            <div className="mt-4 border-t border-subtle" />

            {/* Soft accent action row: theme + settings */}
            <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Actions">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-md border border-accent bg-accent-soft px-2.5 py-1.5 text-xs text-accent hover:bg-surface-subtle transition-colors"
                aria-label="Toggle color theme"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface">
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 text-accent" />
                  ) : (
                    <SunMedium className="h-4 w-4 text-accent" />
                  )}
                </span>
                <span className="truncate">{themeLabel}</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-2 rounded-md border border-accent bg-accent-soft px-2.5 py-1.5 text-xs text-accent hover:bg-surface-subtle transition-colors"
                aria-label="Open settings"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface">
                  <Settings2 className="h-4 w-4 text-accent" />
                </span>
                <span className="truncate">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
