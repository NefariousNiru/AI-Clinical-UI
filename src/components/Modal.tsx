// file: src/components/Modal.tsx

import { type ReactNode, useEffect } from "react";

type ModalProps = {
	open: boolean;
	title?: string | ReactNode;
	onClose?: () => void;
	children: ReactNode;
	headerRight?: ReactNode;
	className?: string;

	// Use for placements
	containerClassName?: string;
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
	containerClassName = "fixed inset-0 z-50 flex items-start justify-center pt-16",
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
		<div className={containerClassName}>
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
					<header className="border-b border-subtle px-5 py-3">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							{/* Left side: title (+ Close on mobile) */}
							<div className="flex items-center justify-between gap-2 min-w-0 sm:block">
								<div
									id={titleId}
									className="text-sm font-semibold text-primary truncate"
								>
									{title}
								</div>

								{/* Close button on mobile (next to title) */}
								{onClose && (
									<button
										type="button"
										onClick={onClose}
										className="h-8 shrink-0 rounded-md border border-subtle bg-surface-subtle px-3 text-sm text-primary hover:bg-surface sm:hidden"
									>
										Close
									</button>
								)}
							</div>

							{/* Right side: headerRight (tabs) + Close on desktop */}
							{(headerRight || onClose) && (
								<div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
									{headerRight && (
										<div className="w-full sm:w-auto">{headerRight}</div>
									)}

									{/* Close button on desktop (after tabs) */}
									{onClose && (
										<button
											type="button"
											onClick={onClose}
											className="hidden h-8 lshrink-0 rounded-md border border-subtle bg-surface-subtle px-3 text-sm text-primary hover:bg-surface sm:inline-flex sm:items-center sm:justify-center"
										>
											Close
										</button>
									)}
								</div>
							)}
						</div>
					</header>
				)}

				<div className="px-5 py-4">{children}</div>
			</div>
		</div>
	);
}
