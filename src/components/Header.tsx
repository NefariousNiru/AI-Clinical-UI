// file: src/components/Header.tsx

import { type ReactNode } from "react";
import { Menu, Moon, Settings2, SunMedium } from "lucide-react";
import { useTheme } from "../providers/theme/useTheme";
import CompanyLogo from "./CompanyLogo";

type HeaderProps = {
	title: string;

	/**
	 * Optional slot to inject something on the left of the logo/title.
	 * Example: back button, breadcrumb, etc.
	 */
	left?: ReactNode;

	/**
	 * Optional centered content (desktop only). Keep this lightweight.
	 * Example: tabs, page title, filters.
	 */
	tabs?: ReactNode;

	/**
	 * Optional right-side content (desktop only). Example: user avatar.
	 */
	right?: ReactNode;

	onSettingsClick?: () => void;

	// Mobile drawer button
	onOpenDrawer?: () => void;
	isDrawerOpen?: boolean;

	/**
	 * Optional aria-controls target id for the drawer/dialog opened by the menu button.
	 */
	drawerControlsId?: string;

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
	drawerControlsId = "app-drawer",
	className = "",
}: HeaderProps) {
	const { theme, toggleTheme } = useTheme();

	// Theme toggle label should describe the action.
	const themeActionLabel = theme === "light" ? "Switch to dark theme" : "Switch to light theme";

	return (
		<header
			className={[
				"h-14 border-b border-subtle app-bg text-primary",
				"px-4 shadow-sm",
				className,
			].join(" ")}
		>
			{/* One layout, responsive:
                - Mobile: 2 columns (left, right)
                - Desktop: 3 columns (left, center, right)
            */}
			<div className="h-full grid grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_auto_1fr]">
				{/* Left */}
				<div className="flex items-center gap-3 min-w-0">
					{left ? <div className="shrink-0">{left}</div> : null}

					{/* If the title is visible text, the logo is typically decorative.
                        This avoids a screen reader reading "Company logo" + title twice.
                    */}
					<CompanyLogo size={24} alt="" aria-hidden="true" />

					<div className="font-semibold truncate">{title}</div>
				</div>

				{/* Center (desktop only) */}
				<div className="hidden md:block justify-self-center">
					{tabs ? <div className="inline-flex items-center gap-2">{tabs}</div> : null}
				</div>

				{/* Right */}
				<div className="justify-self-end flex items-center gap-2">
					{/* Desktop actions */}
					<div className="hidden md:flex items-center gap-2">
						{right ? <div className="flex items-center gap-2">{right}</div> : null}

						<IconButton
							ariaLabel={themeActionLabel}
							onClick={toggleTheme}
							// aria-pressed fits toggles. We expose the current state.
							ariaPressed={theme === "dark"}
						>
							{theme === "light" ? (
								<Moon className="h-4 w-4 text-muted" />
							) : (
								<SunMedium className="h-4 w-4 text-muted" />
							)}
						</IconButton>

						{onSettingsClick ? (
							<IconButton ariaLabel="Open settings" onClick={onSettingsClick}>
								<Settings2 className="h-4 w-4 text-muted" />
							</IconButton>
						) : null}
					</div>

					{/* Mobile menu button */}
					{onOpenDrawer ? (
						<div className="md:hidden">
							<IconButton
								ariaLabel="Open menu"
								onClick={onOpenDrawer}
								ariaHaspopup="dialog"
								ariaExpanded={isDrawerOpen ?? false}
								ariaControls={drawerControlsId}
							>
								<Menu className="h-4 w-4 text-muted" />
							</IconButton>
						</div>
					) : null}
				</div>
			</div>
		</header>
	);
}

/* ----------------- Internal UI primitive -----------------
   Centralizes button styling and keeps Header markup clean.
*/

type IconButtonProps = {
	ariaLabel: string;
	onClick: () => void;
	children: ReactNode;
	ariaPressed?: boolean;
	ariaHaspopup?: "dialog" | "menu" | "listbox";
	ariaExpanded?: boolean;
	ariaControls?: string;
};

function IconButton({
	ariaLabel,
	onClick,
	children,
	ariaPressed,
	ariaHaspopup,
	ariaExpanded,
	ariaControls,
}: IconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
			aria-label={ariaLabel}
			aria-pressed={ariaPressed}
			aria-haspopup={ariaHaspopup}
			aria-expanded={ariaExpanded}
			aria-controls={ariaControls}
		>
			{children}
		</button>
	);
}
