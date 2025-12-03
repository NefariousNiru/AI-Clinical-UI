// file: src/components/Header.tsx

import { type ReactNode } from "react";
import { Menu, Moon, SunMedium, Settings2 } from "lucide-react";
import { useTheme } from "../providers/theme/useTheme";

type HeaderProps = {
  title: string;
  left?: ReactNode;
  tabs?: ReactNode;
  right?: ReactNode;
  onSettingsClick?: () => void;
  onOpenDrawer?: () => void;
  isDrawerOpen?: boolean; // NEW: for aria-expanded
  className?: string;
};

export default function Header({
  title,
  left,
  tabs,
  right,
  onSettingsClick,
  onOpenDrawer,
  isDrawerOpen,
  className = "",
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={[
        "h-14 border-b border-subtle bg-surface text-primary",
        "flex items-center px-4",
        className,
      ].join(" ")}
    >
      <div className="flex w-full items-center">
        {/* Left: title (mobile: flex-1 so hamburger is pushed right) */}
        <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
          {left ? <div className="shrink-0">{left}</div> : null}
          <div className="font-semibold truncate">{title}</div>
        </div>

        {/* Center: tabs (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center">
          {tabs ? (
            <div className="inline-flex items-center gap-2">{tabs}</div>
          ) : null}
        </div>

        {/* Right: desktop controls + mobile hamburger */}
        <div className="flex items-center gap-2">
          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            {right ? (
              <div className="flex items-center gap-2">{right}</div>
            ) : null}
            <ThemeToggleIcon theme={theme} onToggle={toggleTheme} />
            {onSettingsClick ? (
              <SettingsIconButton onClick={onSettingsClick} />
            ) : null}
          </div>

          {/* Mobile: hamburger only */}
          {onOpenDrawer ? (
            <button
              type="button"
              onClick={onOpenDrawer}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-subtle bg-surface-subtle hover:bg-surface transition-colors"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen ?? false}
              aria-pressed={isDrawerOpen ?? false}
              aria-controls="admin-drawer"
            >
              <Menu className="h-4 w-4 text-muted" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ----------------- Internal controls (desktop) ----------------- */

type ThemeToggleIconProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

function ThemeToggleIcon({ theme, onToggle }: ThemeToggleIconProps) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-subtle hover:bg-surface transition-colors"
      aria-label="Toggle color theme"
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-muted" />
      ) : (
        <SunMedium className="h-4 w-4 text-muted" />
      )}
    </button>
  );
}

type SettingsIconButtonProps = {
  onClick: () => void;
};

function SettingsIconButton({ onClick }: SettingsIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-subtle hover:bg-surface transition-colors"
      aria-label="Open settings"
    >
      <Settings2 className="h-4 w-4 text-muted" />
    </button>
  );
}
