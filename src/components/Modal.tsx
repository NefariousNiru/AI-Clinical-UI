// file: src/components/Modal.tsx

import { useEffect, type ReactNode } from "react";

type ModalProps = {
    open: boolean;
    title?: string | ReactNode;
    onClose?: () => void;
    children: ReactNode;
    headerRight?: ReactNode;
    className?: string;
};

/**
 * Generic modal dialog.
 *
 * - ESC to close when `onClose` is provided.
 * - Backdrop click closes when `onClose` is provided.
 * - Uses theme tokens (bg-surface, border-subtle, text-primary).
 * - Accessible: role="dialog", aria-modal, and labelled by title when string.
 */
export default function Modal({
                                  open,
                                  title,
                                  onClose,
                                  children,
                                  headerRight,
                                  className = "w-[min(1000px,95vw)]",
                              }: ModalProps) {
    // Close on ESC
    useEffect(() => {
        if (!open || !onClose) return;

        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose?.();
            }
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const hasHeader = Boolean(title) || Boolean(headerRight);
    const titleId = typeof title === "string" ? "modal-title" : undefined;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-label="Close dialog"
            />

            {/* Dialog panel */}
            <div
                className={[
                    "relative mx-auto rounded-xl border border-subtle app-bg shadow-xl",
                    className,
                ].join(" ")}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                {hasHeader && (
                    <header className="flex items-center justify-between border-b border-subtle px-5 py-3">
                        <div
                            id={titleId}
                            className="text-sm font-semibold text-primary"
                        >
                            {title}
                        </div>
                        <div className="flex items-center gap-2">
                            {headerRight}
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-8 rounded-md border border-subtle bg-surface-subtle px-3 text-sm text-primary hover:bg-surface"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </header>
                )}

                <div className="px-5 py-4">{children}</div>
            </div>
        </div>
    );
}
