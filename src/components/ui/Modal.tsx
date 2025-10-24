// src/components/ui/Modal.tsx
import { useEffect } from "react";

/*
1) Purpose: Reusable modal overlay with backdrop, ESC-to-close, and accessible structure.
2) Usage: <Modal open title="..." onClose={...}>{children}</Modal>
3) Behavior: Click on backdrop or press ESC closes if onClose provided.
4) Styling: Neutral, Tailwind-only. Consumers control content layout.
*/
type ModalProps = {
  open: boolean;
  title?: string | React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode; // optional action area aligned right
  className?: string; // optional width overrides
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  headerRight,
  className = "w-[min(1000px,95vw)]",
}: ModalProps) {
  // close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && onClose) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 5) Backdrop click closes */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose && onClose()}
        aria-hidden="true"
      />
      {/* 6) Centered panel */}
      <div
        className={`absolute inset-x-0 top-16 mx-auto rounded-lg bg-white shadow-xl ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* 7) Header with optional right controls */}
        {(title || headerRight) && (
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="text-sm font-semibold">{title}</div>
            <div className="flex items-center gap-2">
              {headerRight}
              {onClose && (
                <button
                  onClick={onClose}
                  className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* 8) Body renders children as-is */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
