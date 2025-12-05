// file: src/pages/admin/AdminTabs.tsx

import { NavLink } from "react-router-dom";
import {
  CalendarRange,
  BookLock,
  Users2,
  TestTube2,
  BarChart3,
} from "lucide-react";

type AdminTabsVariant = "header" | "drawer";

type AdminTabsProps = {
  variant?: AdminTabsVariant;
  onNavigate?: () => void;
};

type TabConfig = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TABS: TabConfig[] = [
  { label: "Week", to: "/admin/week", icon: CalendarRange },
  { label: "Rubric", to: "/admin/rubric", icon: BookLock },
  { label: "Students", to: "/admin/students", icon: Users2 },
  { label: "Tests", to: "/admin/tests", icon: TestTube2 },
  { label: "Statistics", to: "/admin/statistics", icon: BarChart3 },
];

export function AdminTabs({ variant = "header", onNavigate }: AdminTabsProps) {
  if (variant === "header") {
    return (
      <nav
        aria-label="Admin sections"
        className="inline-flex items-center gap-1 rounded-full border border-subtle bg-surface-subtle px-1 py-0.5 shadow-sm"
      >
        {TABS.map((tab) => (
          <AdminTabLink
            key={tab.to}
            tab={tab}
            variant="header"
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    );
  }

  // Drawer variant
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-col gap-1 mt-3"
    >
      {TABS.map((tab) => (
        <AdminTabLink
          key={tab.to}
          tab={tab}
          variant="drawer"
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

type AdminTabLinkProps = {
  tab: TabConfig;
  variant: AdminTabsVariant;
  onNavigate?: () => void;
};

function AdminTabLink({ tab, variant, onNavigate }: AdminTabLinkProps) {
  const { icon: Icon } = tab;

  return (
    <NavLink
      to={tab.to}
      end={false}
      onClick={onNavigate}
      className={({ isActive }) => {
        if (variant === "header") {
          return [
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            isActive
              ? "bg-accent text-on-accent shadow-sm"
              : "text-muted hover:text-primary hover:bg-surface",
          ].join(" ");
        }

        // drawer variant
        return [
          "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-accent-soft text-accent"
            : "text-muted hover:text-primary hover:bg-surface-subtle",
        ].join(" ");
      }}
    >
      <Icon className={variant === "header" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span>{tab.label}</span>
    </NavLink>
  );
}
