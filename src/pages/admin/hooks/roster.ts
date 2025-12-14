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
    const [actionBusy, setActionBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [existing, setExisting] = useState<RosterStudent[]>([]);
    const [pending, setPendingState] = useState<NewRosterStudent[]>([]);

    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<Set<string>>(
        new Set(),
    );

    // prevent stale async writes on quick semester switch
    const loadToken = useRef(0);

    useEffect(() => {
        setError(null);
        setExisting([]);
        setPendingState([]);
        setSelectedEnrollmentIds(new Set());

        const maybeId = semester?.id;
        if (typeof maybeId !== "number") return;

        const rosterSemesterId: number = maybeId; // <- hard-narrow here

        let active = true;
        const token = (loadToken.current += 1);

        async function load(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                const resp = await fetchRoster(rosterSemesterId); // number
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
            // eligible: only active enrollment (and user active usually implied by your UI rules)
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

            // server returns new student roster entries - append/merge into existing
            setExisting((prev) => mergeRoster(prev, resp.students));
            setPendingState([]);
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to add students.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    async function resendUserActivation(s: RosterStudent): Promise<void> {
        if (!semester) return;
        setActionBusy(true);
        setError(null);
        try {
            await notifyAccountActivation({
                userId: s.userId,
                enrollmentId: s.enrollmentId,
                email: s.email,
                semesterName: semester.name,
                semesterYear: String(semester.year),
            });
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to send activation email.";
            setError(msg);
        } finally {
            setActionBusy(false);
        }
    }

    async function resendEnrollmentActivation(s: RosterStudent): Promise<void> {
        if (!semester) return;
        setActionBusy(true);
        setError(null);
        try {
            await notifyEnrollmentActivation({
                userId: s.userId,
                enrollmentId: s.enrollmentId,
                email: s.email,
                semesterName: semester.name,
                semesterYear: String(semester.year),
            });
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to send enrollment email.";
            setError(msg);
        } finally {
            setActionBusy(false);
        }
    }

    async function deactivateUser(s: RosterStudent): Promise<void> {
        // risky: one at a time
        setActionBusy(true);
        setError(null);
        try {
            await deactivateUserAccount(s.userId);

            // pessimistic UI update
            setExisting((prev) =>
                prev.map((x) =>
                    x.userId === s.userId
                        ? {...x, isActiveUser: false, isActiveSemester: false}
                        : x,
                ),
            );
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to deactivate user.";
            setError(msg);
        } finally {
            setActionBusy(false);
        }
    }

    async function deactivateEnrollment(s: RosterStudent): Promise<void> {
        setActionBusy(true);
        setError(null);
        try {
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
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to deactivate enrollment.";
            setError(msg);
        } finally {
            setActionBusy(false);
        }
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

        setActionBusy(true);
        setError(null);
        try {
            await deactivateSemesterEnrollments(targets);

            setExisting((prev) =>
                prev.map((x) =>
                    targets.includes(x.enrollmentId)
                        ? {...x, isActiveSemester: false}
                        : x,
                ),
            );

            // clear those selections
            setSelectedEnrollmentIds((prev) => {
                const next = new Set(prev);
                for (const id of targets) next.delete(id);
                return next;
            });
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to bulk deactivate enrollments.";
            setError(msg);
        } finally {
            setActionBusy(false);
        }
    }

    return {
        loading,
        error,
        existing,
        pending,
        setPending,
        saving,
        actionBusy,
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
