// file: src/pages/admin/hooks/semester.ts

import {useEffect, useMemo, useState} from "react";
import type {Semester, SemesterName} from "../../../lib/types/semester";
import {fetchAllSemesters} from "../../../lib/api/admin/semester";
import type {SemesterCreateRequest} from "../../../lib/types/semester";
import {createSemester as createSemesterApi} from "../../../lib/api/admin/semester";


export type SemesterComboOption = {
    key: string; // e.g. "Spring-2026"
    name: SemesterName;
    year: number;
    label: string; // "Spring 2026"
    semester: Semester; // full object so we can set resolved without refetch
};

export type UseSemesterSelectionResult = {
    options: SemesterComboOption[];
    selected: SemesterComboOption | null;
    resolvedSemester: Semester | null;
    loading: boolean;
    error: string | null;

    setSelectedKey: (key: string) => void;
    resetToCurrent: () => void;
};

function normalizeYear(raw: Semester["year"]): number {
    if (typeof raw === "number") return raw;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}

function makeKey(name: SemesterName, year: number): string {
    return `${name}-${year}`;
}

function makeLabel(name: SemesterName, year: number): string {
    return `${name} ${year}`;
}

function semesterSortKey(s: Semester): [number, number] {
    // sort by year asc, then Spring/Summer/Fall
    const y = normalizeYear(s.year);
    const seasonOrder = s.name === "Spring" ? 1 : s.name === "Summer" ? 2 : 3;
    return [y, seasonOrder];
}

export function useSemesterSelection(): UseSemesterSelectionResult {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedKey, setSelectedKeyState] = useState<string | null>(null);
    const [resolvedSemester, setResolvedSemester] = useState<Semester | null>(
        null,
    );

    const [currentKey, setCurrentKey] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadAll(): Promise<void> {
            setLoading(true);
            setError(null);

            try {
                const all = await fetchAllSemesters();
                if (!active) return;

                // stable sort for nice dropdown ordering
                const sorted = [...all].sort((a, b) => {
                    const [ya, sa] = semesterSortKey(a);
                    const [yb, sb] = semesterSortKey(b);
                    if (ya !== yb) return ya - yb;
                    return sa - sb;
                });

                const current = sorted.find((s) => s.isCurrent) ?? sorted[0] ?? null;

                setSemesters(sorted);

                if (current) {
                    const y = normalizeYear(current.year);
                    const key = makeKey(current.name, y);

                    setCurrentKey(key);
                    setSelectedKeyState(key);
                    setResolvedSemester(current);
                } else {
                    setCurrentKey(null);
                    setSelectedKeyState(null);
                    setResolvedSemester(null);
                }
            } catch (e) {
                if (!active) return;
                const msg =
                    e instanceof Error && e.message.trim()
                        ? e.message
                        : "Failed to load semesters.";
                setError(msg);
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadAll();

        return () => {
            active = false;
        };
    }, []);

    const options: SemesterComboOption[] = useMemo(() => {
        return semesters.map((s) => {
            const y = normalizeYear(s.year);
            return {
                key: makeKey(s.name, y),
                name: s.name,
                year: y,
                label: makeLabel(s.name, y),
                semester: s,
            };
        });
    }, [semesters]);

    const selected: SemesterComboOption | null = useMemo(() => {
        if (!selectedKey) return null;
        return options.find((o) => o.key === selectedKey) ?? null;
    }, [options, selectedKey]);

    function setSelectedKey(key: string): void {
        const opt = options.find((o) => o.key === key);
        if (!opt) return;

        // purely client-side now
        setSelectedKeyState(opt.key);
        setResolvedSemester(opt.semester);
        setError(null);
    }

    function resetToCurrent(): void {
        if (!currentKey) return;
        setSelectedKey(currentKey);
    }

    return {
        options,
        selected,
        resolvedSemester,
        loading,
        error,
        setSelectedKey,
        resetToCurrent,
    };
}

export type UseCreateSemesterResult = {
    saving: boolean;
    error: string | null;
    clearError: () => void;
    create: (req: SemesterCreateRequest) => Promise<void>;
};

export function useCreateSemester(): UseCreateSemesterResult {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function clearError() {
        setError(null);
    }

    async function create(req: SemesterCreateRequest): Promise<void> {
        setError(null);
        setSaving(true);

        try {
            await createSemesterApi(req);
        } catch (e: unknown) {
            console.dir(e)
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to create semester.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setSaving(false);
        }
    }

    return {saving, error, clearError, create};
}

