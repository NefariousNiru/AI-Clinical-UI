// file: src/providers/theme/ThemeProvider.tsx
import { type ReactNode, useEffect, useState } from "react";
import { ThemeContext, type Theme } from "./themeContext";
import {LOCAL_STORAGE_THEME_KEY} from "../../lib/constants/localStorageKeys.ts";

type ThemeProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = LOCAL_STORAGE_THEME_KEY

function getInitialTheme(): Theme {
  // 1) LocalStorage wins if present
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    // 2) Else prefer OS setting
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) return "dark";
  }

  // 3) Fallback
  return "light";
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("theme-dark");
  } else {
    root.classList.remove("theme-dark");
  }
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyThemeToDocument(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
  }

  function toggleTheme() {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }

  const value = { theme, setTheme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
