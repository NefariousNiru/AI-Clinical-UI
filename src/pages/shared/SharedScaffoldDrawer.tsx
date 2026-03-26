// file: src/pages/shared/SharedScaffoldDrawer.tsx

import {useEffect, useRef, type ReactNode} from "react";
import {X, Moon, SunMedium, Settings2} from "lucide-react";
import {useTheme} from "../../providers/theme/useTheme";

type SharedScaffoldDrawerProps = {
    open: boolean;
    onClose: () => void;

    // a stable id to differentiate drawers for aria/targeting
    drawerId: string;

    // header text
    title: string;
    subtitle?: string;

    // optional top section (ex: "Navigation" + tabs)
    sectionLabel?: string;
    section?: ReactNode;

    // actions
    actionsLabel?: string; // default: "Actions"
    onOpenSettings?: () => void;
};

/**
 * Shared mobile drawer shell used by both Admin + Student layouts.
 * - Focuses close button on open
 * - ESC to close
 * - Backdrop click to close
 * - Theme toggle + Settings actions
 */
export default function SharedScaffoldDrawer({
                                                 open,
                                                 onClose,
                                                 drawerId,
                                                 title,
                                                 subtitle,
                                                 sectionLabel,
                                                 section,
                                                 actionsLabel = "Actions",
                                                 onOpenSettings,
                                             }: SharedScaffoldDrawerProps) {
    const {theme, toggleTheme} = useTheme();
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (open && closeButtonRef.current) closeButtonRef.current.focus();
    }, [open]);

    function handleKeyDown(ev: React.KeyboardEvent<HTMLDivElement>) {
        if (ev.key === "Escape") {
            ev.stopPropagation();
            onClose();
        }
    }

    if (!open) return null;

    const themeLabel = theme === "light" ? "Dark mode" : "Light mode";
    const titleId = `${drawerId}-title`;
    const hasSection = Boolean(section);

    return (
        <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                id={drawerId}
                className="absolute inset-y-0 right-0 w-72 bg-surface border-l border-subtle shadow-xl flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onKeyDown={handleKeyDown}
            >
                {/* Header row */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
                    <div className="min-w-0">
                        <div id={titleId} className="text-sm font-semibold text-primary">
                            {title}
                        </div>
                        {subtitle ? (
                            <div className="mt-0.5 text-xs text-muted truncate">
                                {subtitle}
                            </div>
                        ) : null}
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-subtle bg-surface-subtle hover:bg-surface transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4 text-muted"/>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {hasSection ? (
                        <div>
                            {sectionLabel ? (
                                <div className="text-xs font-medium text-muted">{sectionLabel}</div>
                            ) : null}

                            <div className={sectionLabel ? "mt-2" : ""}>{section}</div>

                            <div className="mt-4 border-t border-subtle"/>
                        </div>
                    ) : null}

                    <div>
                        <div className="text-xs font-medium text-muted">{actionsLabel}</div>

                        <div className="mt-3 grid grid-cols-2 gap-2" aria-label={actionsLabel}>
                            {/* Theme toggle */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex items-center gap-2 rounded-md border border-accent bg-accent-soft px-2.5 py-1.5 text-xs text-accent hover:bg-surface-subtle transition-colors"
                                aria-label="Toggle color theme"
                            >
                                <span
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface">
                                    {theme === "light" ? (
                                        <Moon className="h-4 w-4 text-accent"/>
                                    ) : (
                                        <SunMedium className="h-4 w-4 text-accent"/>
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
                                <span
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface">
                                    <Settings2 className="h-4 w-4 text-accent"/>
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
