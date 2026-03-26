// file: src/providers/theme/useTheme.ts
import { useContext } from "react";
import type { ThemeContextValue } from "./themeContext";
import { ThemeContext } from "./themeContext";

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return ctx;
}
