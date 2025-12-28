// file: src/pages/admin/weeks/StatusPill.tsx

import type { WeeklyWorkupStatus } from "../../../lib/types/weeks";

function statusPillClasses(status: WeeklyWorkupStatus): string {
    if (status === "feedback_available") return "bg-status-feedback text-status-feedback";
    if (status === "locked") return "bg-status-locked text-status-locked";
    if (status === "available") return "bg-status-available text-status-available";
    return "bg-secondary-soft text-secondary";
}

function statusLabel(status: WeeklyWorkupStatus): string {
    if (status === "locked") return "Locked";
    if (status === "feedback_available") return "Feedback Available";
    return "Available";
}

export default function StatusPill({ status }: { status: WeeklyWorkupStatus }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                statusPillClasses(status),
            ].join(" ")}
            title={status}
        >
      {statusLabel(status)}
    </span>
    );
}
