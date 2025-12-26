// file: src/components/Header.tsx

import {type ReactNode} from "react";
import {Menu, Moon, SunMedium, Settings2} from "lucide-react";
import {useTheme} from "../providers/theme/useTheme";
import CompanyLogo from "./CompanyLogo.tsx";

type HeaderProps = {
    title: string;
    left?: ReactNode;
    tabs?: ReactNode;
    right?: ReactNode;
    onSettingsClick?: () => void;
    onOpenDrawer?: () => void;
    isDrawerOpen?: boolean;
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
    const {theme, toggleTheme} = useTheme();

    return (
        <header
            className={[
                "h-14 border-b border-subtle app-bg text-primary",
                "px-4 shadow-sm",
                className,
            ].join(" ")}
        >
            {/* Desktop: 3-column grid to keep tabs truly centered */}
            <div className="hidden h-full md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                    {left ? <div className="shrink-0">{left}</div> : null}
                    <CompanyLogo size={20}/>
                    <div className="font-semibold truncate">{title}</div>
                </div>

                {/* Center */}
                <div className="justify-self-center">
                    {tabs ? <div className="inline-flex items-center gap-2">{tabs}</div> : null}
                </div>

                {/* Right */}
                <div className="justify-self-end flex items-center gap-2">
                    {right ? <div className="flex items-center gap-2">{right}</div> : null}
                    <ThemeToggleIcon theme={theme} onToggle={toggleTheme}/>
                    {onSettingsClick ? <SettingsIconButton onClick={onSettingsClick}/> : null}
                </div>
            </div>

            {/* Mobile: keep your current layout (tabs hidden anyway) */}
            <div className="flex h-full items-center md:hidden">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {left ? <div className="shrink-0">{left}</div> : null}
                    <CompanyLogo size={20}/>
                    <div className="font-semibold truncate">{title}</div>
                </div>

                {onOpenDrawer ? (
                    <button
                        type="button"
                        onClick={onOpenDrawer}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
                        aria-label="Open menu"
                        aria-haspopup="dialog"
                        aria-expanded={isDrawerOpen ?? false}
                        aria-pressed={isDrawerOpen ?? false}
                        aria-controls="admin-drawer"
                    >
                        <Menu className="h-4 w-4 text-muted"/>
                    </button>
                ) : null}
            </div>
        </header>
    );
}

/* ----------------- Internal controls (desktop) ----------------- */

type ThemeToggleIconProps = {
    theme: "light" | "dark";
    onToggle: () => void;
};

function ThemeToggleIcon({theme, onToggle}: ThemeToggleIconProps) {
    const isLight = theme === "light";

    return (
        <button
            type="button"
            onClick={onToggle}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
            aria-label="Toggle color theme"
        >
            {isLight ? (
                <Moon className="h-4 w-4 text-muted"/>
            ) : (
                <SunMedium className="h-4 w-4 text-muted"/>
            )}
        </button>
    );
}

type SettingsIconButtonProps = {
    onClick: () => void;
};

function SettingsIconButton({onClick}: SettingsIconButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
            aria-label="Open settings"
        >
            <Settings2 className="h-4 w-4 text-muted"/>
        </button>
    );
}
