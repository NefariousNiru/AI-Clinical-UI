// file: src/pages/admin/tests/LocalSessionsModal.tsx

import {useEffect, useState} from "react";
import Modal from "../../../components/Modal";
import {
    getAllSessions,
    deleteSession,
    downloadSession,
    type SavedSession,
} from "../../../lib/localSession";
import ProblemFeedbackView from "../../shared/feedback/ProblemFeedbackView.tsx" // adjust path if needed

type LocalSessionsModalProps = {
    open: boolean;
    onClose: () => void;
};

function timeLabel(ts: number | undefined) {
    if (!ts) return "Unknown time";
    const d = new Date(ts);
    return d.toLocaleString();
}

export default function LocalSessionsModal({
                                               open,
                                               onClose,
                                           }: LocalSessionsModalProps) {
    const [sessions, setSessions] = useState<SavedSession[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // load + live refresh on custom event
    useEffect(() => {
        function load() {
            const list = getAllSessions();
            setSessions(Array.isArray(list) ? list : []);
        }

        load();
        const handler = () => load();
        window.addEventListener("local-sessions:changed", handler);
        return () => window.removeEventListener("local-sessions:changed", handler);
    }, []);

    // When opened, refresh list
    useEffect(() => {
        if (!open) return;
        const list = getAllSessions();
        setSessions(Array.isArray(list) ? list : []);
    }, [open]);

    const selectedSession =
        selectedId != null
            ? sessions.find((s) => typeof s.id === "number" && s.id === selectedId) ??
            null
            : null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Saved local sessions"
            className="w-[min(960px,95vw)]"
        >
            {/* This wrapper gives the modal body a scrollable area */}
            <div className="max-h-[70vh] overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
                    {/* Left: sessions list */}
                    <div className="space-y-2">
                        <div className="text-xs text-muted">
                            {sessions.length === 0
                                ? "No saved sessions yet."
                                : `Saved sessions: ${sessions.length}`}
                        </div>
                        <div className="rounded-md border border-subtle divide-y max-h-[60vh] overflow-auto">
                            {sessions.length === 0 ? (
                                <div className="p-3 text-xs text-muted">
                                    Run a test, then use “Save local” to store it.
                                </div>
                            ) : (
                                sessions.map((s, idx) => {
                                    const sid = typeof s.id === "number" ? s.id : null;
                                    const key = sid ?? s.createdAt ?? idx;
                                    const isSelected = sid != null && sid === selectedId;

                                    return (
                                        <div
                                            key={String(key)}
                                            className={[
                                                "px-3 py-2 text-xs",
                                                isSelected ? "bg-accent-soft" : "bg-surface",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <button
                                                    type="button"
                                                    className="text-left flex-1"
                                                    onClick={() =>
                                                        setSelectedId(isSelected ? null : sid ?? null)
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-muted">
                                                          • {timeLabel(s.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-[11px] text-muted">
                                                        Model:{" "}
                                                        <span className="font-medium text-primary">
                                                          {s.model}
                                                        </span>{" "}
                                                        • Submission #{s.submissionId}
                                                    </div>
                                                </button>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="h-7 rounded-md border border-subtle bg-surface px-2 text-[11px] hover:bg-surface-subtle"
                                                        onClick={() => downloadSession(s)}
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="h-7 rounded-md border border-red-300 bg-red-50 px-2 text-[11px] text-red-700 hover:bg-red-100"
                                                        onClick={() => {
                                                            if (typeof s.id === "number") {
                                                                deleteSession(s.id);
                                                                if (selectedId === s.id) setSelectedId(null);
                                                            }
                                                            const list = getAllSessions();
                                                            setSessions(Array.isArray(list) ? list : []);
                                                        }}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: details for selected session */}
                    <div className="space-y-3">
                        {selectedSession ? (
                            <>
                                <div className="rounded-md border border-subtle bg-surface-subtle p-3">
                                    <div className="text-xs font-medium mb-1">System prompt</div>
                                    <pre className="whitespace-pre-wrap break-words text-xs text-primary">
                                        {selectedSession.systemPrompt}
                                    </pre>
                                </div>

                                <div className="rounded-md border border-accent-soft bg-accent-soft/40 p-3">
                                    <div className="text-xs font-medium mb-1 text-primary">
                                        Output (feedback)
                                    </div>
                                    <div className="max-h-[40vh] overflow-auto">
                                        <ProblemFeedbackView data={selectedSession.feedback}/>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-xs text-muted">
                                    Select a session from the list to view details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
