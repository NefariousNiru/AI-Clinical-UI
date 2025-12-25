// file: src/pages/admin/hooks/roster.ts

import {useEffect, useMemo, useRef, useState} from "react";
import type {Semester} from "../../../lib/types/semester";
import type {
    NewRosterStudent,
    RosterResponse,
    RosterStudent,
} from "../../../lib/types/roster";
import {
    addRosterStudents,
    deactivateSemesterEnrollments,
    deactivateUserAccount,
    fetchRoster,
    notifyAccountActivation,
    notifyEnrollmentActivation,
} from "../../../lib/api/admin/roster";

export type UseRosterResult = {
    loading: boolean;
    error: string | null;

    existing: RosterStudent[];
    pending: NewRosterStudent[];
    setPending: (fn: (prev: NewRosterStudent[]) => NewRosterStudent[]) => void;

    saving: boolean;

    actionBusy: boolean;
    actionBusyKey: string | null;
    actionToast: { tone: "success" | "danger"; text: string } | null;

    selectedEnrollmentIds: Set<string>;
    toggleEnrollmentSelected: (enrollmentId: string) => void;
    clearEnrollmentSelection: () => void;
    bulkDeactivateEligibleCount: number;

    savePendingToDb: () => Promise<void>;

    resendUserActivation: (s: RosterStudent) => Promise<void>;
    resendEnrollmentActivation: (s: RosterStudent) => Promise<void>;

    deactivateUser: (s: RosterStudent) => Promise<void>;
    deactivateEnrollment: (s: RosterStudent) => Promise<void>;

    bulkDeactivateSemester: () => Promise<void>;
};

export function useRoster(semester: Semester | null): UseRosterResult {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // REPLACE coarse busy with a key, but keep boolean export
    const [actionBusyKey, setActionBusyKey] = useState<string | null>(null);
    const actionBusy = Boolean(actionBusyKey);

    const [error, setError] = useState<string | null>(null);

    const [actionToast, setActionToast] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    const [existing, setExisting] = useState<RosterStudent[]>([]);
    const [pending, setPendingState] = useState<NewRosterStudent[]>([]);

    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<Set<string>>(
        new Set(),
    );

    // prevent stale async writes on quick semester switch
    const loadToken = useRef(0);

    function clearToastTimer() {
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
    }

    function pushToast(tone: "success" | "danger", text: string) {
        clearToastTimer();
        setActionToast({tone, text});
        toastTimerRef.current = window.setTimeout(() => {
            setActionToast(null);
            toastTimerRef.current = null;
        }, 4500);
    }

    useEffect(() => {
        return () => {
            clearToastTimer();
        };
    }, []);

    useEffect(() => {
        setError(null);
        setActionToast(null);
        setExisting([]);
        setPendingState([]);
        setSelectedEnrollmentIds(new Set());

        const maybeId = semester?.id;
        if (typeof maybeId !== "number") return;

        const rosterSemesterId: number = maybeId;

        let active = true;
        const token = (loadToken.current += 1);

        async function load(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                const resp = await fetchRoster(rosterSemesterId);
                if (!active) return;
                if (token !== loadToken.current) return;
                setExisting(resp.students);
            } catch (e) {
                if (!active) return;
                const msg =
                    e instanceof Error && e.message.trim()
                        ? e.message
                        : "Failed to load roster.";
                setError(msg);
            } finally {
                if (active) setLoading(false);
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [semester?.id]);

    function setPending(fn: (prev: NewRosterStudent[]) => NewRosterStudent[]): void {
        setPendingState((prev) => fn(prev));
    }

    function toggleEnrollmentSelected(enrollmentId: string): void {
        setSelectedEnrollmentIds((prev) => {
            const next = new Set(prev);
            if (next.has(enrollmentId)) next.delete(enrollmentId);
            else next.add(enrollmentId);
            return next;
        });
    }

    function clearEnrollmentSelection(): void {
        setSelectedEnrollmentIds(new Set());
    }

    const bulkDeactivateEligibleCount = useMemo(() => {
        if (selectedEnrollmentIds.size === 0) return 0;
        let n = 0;
        for (const s of existing) {
            if (!selectedEnrollmentIds.has(s.enrollmentId)) continue;
            if (s.isActiveUser && s.isActiveSemester) n += 1;
        }
        return n;
    }, [existing, selectedEnrollmentIds]);

    async function savePendingToDb(): Promise<void> {
        if (!semester) return;
        if (pending.length === 0) return;

        setSaving(true);
        setError(null);

        try {
            const resp: RosterResponse = await addRosterStudents({
                semesterName: semester.name,
                semesterYear: String(semester.year),
                students: pending,
            });

            setExisting((prev) => mergeRoster(prev, resp.students));
            setPendingState([]);
            pushToast("success", "Students added.");
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to add students.";
            setError(msg);
            pushToast("danger", msg);
        } finally {
            setSaving(false);
        }
    }

    async function runAction(opts: {
        key: string;
        successText: string;
        fn: () => Promise<void>;
        errorFallback: string;
    }): Promise<void> {
        if (actionBusyKey) return; // keep "one action at a time" semantics you already had
        setActionBusyKey(opts.key);
        setError(null);
        setActionToast(null);

        try {
            await opts.fn();
            pushToast("success", opts.successText);
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : opts.errorFallback;
            setError(msg);
            pushToast("danger", msg);
            throw e;
        } finally {
            setActionBusyKey(null);
        }
    }

    async function resendUserActivation(s: RosterStudent): Promise<void> {
        if (!semester) return;

        await runAction({
            key: `user:${s.userId}:resend_user`,
            successText: "User activation email queued.",
            errorFallback: "Failed to send activation email.",
            fn: async () => {
                await notifyAccountActivation({
                    userId: s.userId,
                    enrollmentId: s.enrollmentId,
                    email: s.email,
                    semesterName: semester.name,
                    semesterYear: String(semester.year),
                });
            },
        });
    }

    async function resendEnrollmentActivation(s: RosterStudent): Promise<void> {
        if (!semester) return;

        await runAction({
            key: `enr:${s.enrollmentId}:resend_enrollment`,
            successText: "Enrollment activation email queued.",
            errorFallback: "Failed to send enrollment email.",
            fn: async () => {
                await notifyEnrollmentActivation({
                    userId: s.userId,
                    enrollmentId: s.enrollmentId,
                    email: s.email,
                    semesterName: semester.name,
                    semesterYear: String(semester.year),
                });
            },
        });
    }

    async function deactivateUser(s: RosterStudent): Promise<void> {
        await runAction({
            key: `user:${s.userId}:deactivate`,
            successText: "User deactivated.",
            errorFallback: "Failed to deactivate user.",
            fn: async () => {
                await deactivateUserAccount(s.userId);

                setExisting((prev) =>
                    prev.map((x) =>
                        x.userId === s.userId
                            ? {...x, isActiveUser: false, isActiveSemester: false}
                            : x,
                    ),
                );
            },
        });
    }

    async function deactivateEnrollment(s: RosterStudent): Promise<void> {
        await runAction({
            key: `enr:${s.enrollmentId}:disenroll`,
            successText: "Student disenrolled from the semester.",
            errorFallback: "Failed to deactivate enrollment.",
            fn: async () => {
                await deactivateSemesterEnrollments([s.enrollmentId]);

                setExisting((prev) =>
                    prev.map((x) =>
                        x.enrollmentId === s.enrollmentId
                            ? {...x, isActiveSemester: false}
                            : x,
                    ),
                );

                setSelectedEnrollmentIds((prev) => {
                    const next = new Set(prev);
                    next.delete(s.enrollmentId);
                    return next;
                });
            },
        });
    }

    async function bulkDeactivateSemester(): Promise<void> {
        if (selectedEnrollmentIds.size === 0) return;

        const targets = existing
            .filter(
                (s) =>
                    selectedEnrollmentIds.has(s.enrollmentId) &&
                    s.isActiveUser &&
                    s.isActiveSemester,
            )
            .map((s) => s.enrollmentId);

        if (targets.length === 0) return;

        await runAction({
            key: `bulk:disenroll:${targets.length}`,
            successText: `Disenrolled ${targets.length} enrollment(s).`,
            errorFallback: "Failed to bulk deactivate enrollments.",
            fn: async () => {
                await deactivateSemesterEnrollments(targets);

                setExisting((prev) =>
                    prev.map((x) =>
                        targets.includes(x.enrollmentId)
                            ? {...x, isActiveSemester: false}
                            : x,
                    ),
                );

                setSelectedEnrollmentIds((prev) => {
                    const next = new Set(prev);
                    for (const id of targets) next.delete(id);
                    return next;
                });
            },
        });
    }

    return {
        loading,
        error,
        existing,
        pending,
        setPending,
        saving,

        actionBusy,
        actionBusyKey,
        actionToast,

        selectedEnrollmentIds,
        toggleEnrollmentSelected,
        clearEnrollmentSelection,
        bulkDeactivateEligibleCount,
        savePendingToDb,
        resendUserActivation,
        resendEnrollmentActivation,
        deactivateUser,
        deactivateEnrollment,
        bulkDeactivateSemester,
    };
}

/* ----------------- helpers ----------------- */

function mergeRoster(prev: RosterStudent[], next: RosterStudent[]): RosterStudent[] {
    const byEnrollment = new Map<string, RosterStudent>();
    for (const s of prev) byEnrollment.set(s.enrollmentId, s);
    for (const s of next) byEnrollment.set(s.enrollmentId, s);
    return Array.from(byEnrollment.values());
}
