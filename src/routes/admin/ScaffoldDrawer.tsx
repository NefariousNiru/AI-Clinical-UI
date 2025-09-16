// src/routes/admin/ScaffoldDrawer.tsx
import { useEffect } from "react"

type Item = { id: string | number; title: string; subtitle?: string }

type Props = {
  open: boolean
  onClose: () => void
  sessions: Item[]
  histories: Item[]
}

export default function ScaffoldDrawer({ open, onClose, sessions, histories }: Props) {
  // Close on Esc
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Always render so we can animate out; disable interaction when closed
  return (
    <div
      className={[
        "fixed inset-x-0 top-14 bottom-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      ].join(" ")}
      aria-hidden={open ? "false" : "true"}
    >
      {/* Backdrop with fade */}
      <div
        onClick={open ? onClose : undefined}
        className={[
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        ].join(" ")}
      />

      {/* Sliding panel */}
      <div
        className={[
          "absolute left-0 top-0 h-full w-[320px] max-w-[90vw] bg-white shadow-xl border-r border-gray-200",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-sm font-semibold">Sessions & History</div>
          <button
            onClick={onClose}
            className="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-44px)] overflow-auto p-3 space-y-4">
          {/* Sessions */}
          <section>
            <div className="mb-2 text-xs font-semibold text-gray-600">Sessions</div>
            <div className="rounded-md border border-gray-200 divide-y">
              {sessions.length === 0 ? (
                <div className="p-3 text-xs text-gray-500">No sessions yet</div>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    onClick={() => {
                      // TODO: navigate to session view
                      onClose()
                    }}
                  >
                    <div className="text-sm font-medium">{s.title}</div>
                    {s.subtitle && (
                      <div className="text-xs text-gray-500 truncate">{s.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* History */}
          <section>
            <div className="mb-2 text-xs font-semibold text-gray-600">History</div>
            <div className="rounded-md border border-gray-200 divide-y">
              {histories.length === 0 ? (
                <div className="p-3 text-xs text-gray-500">No history yet</div>
              ) : (
                histories.map((h) => (
                  <button
                    key={h.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    onClick={() => {
                      // TODO: open historical prompt/output
                      onClose()
                    }}
                  >
                    <div className="text-sm font-medium">{h.title}</div>
                    {h.subtitle && (
                      <div className="text-xs text-gray-500 truncate">{h.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
