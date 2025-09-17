// src/routes/admin/ScaffoldDrawer.tsx
import { useEffect, useState } from "react"
import { getAllSessions, deleteSession, downloadSession, type SavedSession } from "../../lib/localSession"
import ProblemFeedbackView from "./ProblemFeedbackView"

type Props = {
  open: boolean
  onClose: () => void
}

function timeLabel(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

export default function ScaffoldDrawer({ open, onClose }: Props) {
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // load + live refresh on custom event
  useEffect(() => {
    function load() { setSessions(getAllSessions()) }
    load()
    const h = () => load()
    window.addEventListener("local-sessions:changed", h)
    return () => window.removeEventListener("local-sessions:changed", h)
  }, [])

  useEffect(() => {
    if (!open) return
    setSessions(getAllSessions())
  }, [open])


  if (!open) return null

  return (
    <div
      className={[
        "fixed inset-x-0 top-14 bottom-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      ].join(" ")}
      aria-hidden={open ? "false" : "true"}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className={[
        "absolute left-0 top-0 h-full w-[380px] max-w-[95vw] bg-white shadow-xl border-r border-gray-200",
        "transform transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full"
      ].join(" ")}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-sm font-semibold">Saved Sessions</div>
          <button
            onClick={onClose}
            className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-44px)] overflow-auto p-3 space-y-4">
          {/* Sessions list */}
          <div className="rounded-md border border-gray-200 divide-y">
            {sessions.length === 0 ? (
              <div className="p-3 text-xs text-gray-500">No saved sessions yet</div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="text-left flex-1"
                      onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">• {timeLabel(s.createdAt)}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        Model: <span className="font-medium">{s.model}</span> • Submission #{s.submissionId}
                      </div>
                    </button>
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        className="h-7 rounded-md border border-gray-300 bg-white px-2 text-xs hover:bg-gray-50"
                        onClick={() => downloadSession(s)}
                      >
                        Download
                      </button>
                      <button
                        className="h-7 rounded-md border border-red-300 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100"
                        onClick={() => {
                          deleteSession(s.id)
                          // if we deleted the selected one, clear selection
                          if (selectedId === s.id) setSelectedId(null)
                          // refresh
                          setSessions(getAllSessions())
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {selectedId === s.id && (
                    <div className="mt-2 space-y-2">
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
                        <div className="text-xs font-medium mb-1">System Prompt</div>
                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-800">{s.systemPrompt}</pre>
                      </div>
                      <div className="rounded-md border border-orange-200 bg-orange-50 p-2">
                        <div className="text-xs font-medium mb-1 text-orange-800">Output (Feedback)</div>
                        <div className="max-h-[40vh] overflow-auto">
                          <ProblemFeedbackView data={s.feedback} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
