// file: src/pages/admin/weeks/WeeksListCard.tsx

import type {WeeklyWorkupListItem, WeeklyWorkupStatus} from "../../../lib/types/weeks";
import StatusPill from "./StatusPill";
import {unixToIsoDate} from "../../../lib/utils/functions.ts";

type Props = {
    weeks: WeeklyWorkupListItem[];
    loading: boolean;
    error: string | null;

    activeWeekId: number | null;
    canAdd: boolean;

    onAddWeek: () => void;
    onSelectWeek: (weekId: number, status: WeeklyWorkupStatus) => void;
};

export default function WeeksListCard({
                                          weeks,
                                          loading,
                                          error,
                                          activeWeekId,
                                          canAdd,
                                          onAddWeek,
                                          onSelectWeek,
                                      }: Props) {
    return (
        <div className="rounded-3xl border border-subtle p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Weeks</h2>
                    <p className="text-sm text-muted">Get week status, view past weeks, edit future weeks, or add a new one.</p>
                </div>

                <button
                    type="button"
                    className={[
                        "px-3 py-2 rounded-xl bg-accent text-on-accent text-sm font-medium",
                        canAdd ? "btn-hover" : "opacity-50 cursor-not-allowed",
                    ].join(" ")}
                    onClick={canAdd ? onAddWeek : undefined}
                    disabled={!canAdd}
                    title={canAdd ? "Add a new week" : "Add Week is only allowed for the current semester."}
                >
                    Add Week
                </button>
            </div>

            <div className="mt-4 border border-subtle rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-accent text-xs font-semibold text-on-accent">
                    <div className="col-span-1 text-left">Week No</div>
                    <div className="col-span-4">Patient Name</div>
                    <div className="col-span-2">Start Date</div>
                    <div className="col-span-2">End Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {loading ? (
                    <div className="px-3 py-3 text-sm text-muted">Loading weeks...</div>
                ) : error ? (
                    <div className="px-3 py-3 text-sm text-danger">{error}</div>
                ) : weeks.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted">No weeks found for this semester.</div>
                ) : (
                    <div className="divide-y divide-[var(--color-border-subtle)]">
                        {weeks.map((w) => {
                            const isActive = activeWeekId === w.id;
                            const actionLabel = w.status === "locked" ? "Edit" : "View";
                            const patientDisplay = `${w.patientFirstName} ${w.patientLastName}`.trim();

                            return (
                                <button
                                    key={w.id}
                                    type="button"
                                    className={[
                                        "w-full text-left px-3 py-2 grid grid-cols-12 gap-2 items-center row-item",
                                        isActive ? "is-active bg-surface-subtle" : "",
                                    ].join(" ")}
                                    onClick={() => onSelectWeek(w.id, w.status)}
                                >
                                    <div className="col-span-1 text-sm">{w.weekNo}</div>
                                    <div className="col-span-4 text-sm">{patientDisplay || "—"}</div>
                                    <div className="col-span-2 text-sm text-muted">{unixToIsoDate(w.start)}</div>
                                    <div className="col-span-2 text-sm text-muted">{unixToIsoDate(w.end)}</div>
                                    <div className="col-span-2 text-sm text-muted"><StatusPill status={w.status}/></div>
                                    <div className="col-span-1 text-sm text-accent font-medium text-right"> {actionLabel}</div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
