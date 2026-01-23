// file: src/pages/admin/hooks/submissionAndDeadlines.ts

import type { WeeklyWorkupDropdownItem } from "../students/WeeklyWorkupDropdown.tsx";
import type { SubmissionView } from "../../../lib/types/studentDeadlines.ts";
import type { Semester } from "../../../lib/types/semester.ts";
import { useEffect, useMemo, useState } from "react";
import { unixToIsoDate } from "../../../lib/utils/functions.ts";
import { getSubmissionsForWeek } from "../../../lib/api/admin/studentDeadlines.ts";
import { errMsg } from "./rubric.ts";

const DEFAULT_LIMIT = 50;

type UseSubmissionDeadlinesState = {
	// selection
	weeklyWorkupId: number | null;
	selectedWeek: WeeklyWorkupDropdownItem | null;
	setWeek: (id: number | null, item: WeeklyWorkupDropdownItem | null) => void;

	// limit
	limit: number;
	setLimit: (n: number) => void;

	// data
	items: SubmissionView[];
	loading: boolean;
	error: string | null;

	// pagination
	canPrev: boolean;
	canNext: boolean;
	prevPage: () => void;
	nextPage: () => void;

	// derived UI helpers
	summaryText: string;
	weekMeta: { start: string; end: string } | null;

	// actions
	actionsDisabled: boolean;
};

export function useSubmissionDeadlines(semester: Semester | null): UseSubmissionDeadlinesState {
	const [weeklyWorkupId, setWeeklyWorkupId] = useState<number | null>(null);
	const [selectedWeek, setSelectedWeek] = useState<WeeklyWorkupDropdownItem | null>(null);

	const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);

	const [items, setItems] = useState<SubmissionView[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [cursor, setCursor] = useState<string | null>(null);
	const [cursorStack, setCursorStack] = useState<Array<string | null>>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);

	const canPrev = cursorStack.length > 0;
	const canNext = !!nextCursor;

	const hasSemester = !!semester;

	const summaryText = useMemo(() => {
		if (!semester) return "Select a semester to view submissions.";
		return `${semester.name} ${String(semester.year)}`;
	}, [semester]);

	const weekMeta = useMemo(() => {
		if (!selectedWeek) return null;
		return {
			start: unixToIsoDate(selectedWeek.start),
			end: unixToIsoDate(selectedWeek.end),
		};
	}, [selectedWeek]);

	function resetResults(): void {
		setItems([]);
		setError(null);
		setCursor(null);
		setCursorStack([]);
		setNextCursor(null);
	}

	function setWeek(id: number | null, item: WeeklyWorkupDropdownItem | null): void {
		setWeeklyWorkupId(id);
		setSelectedWeek(item);
	}

	// Semester change: hard reset everything selection-related + results
	useEffect(() => {
		setWeeklyWorkupId(null);
		setSelectedWeek(null);
		resetResults();
		// keep limit stable across semesters (usually desired)
	}, [semester?.id]);

	// Week change: reset paging/results. If cleared, clear selected week meta.
	useEffect(() => {
		if (!weeklyWorkupId) setSelectedWeek(null);
		resetResults();
	}, [weeklyWorkupId]);

	function prevPage(): void {
		setCursorStack((st) => {
			if (st.length === 0) return st;
			const next = [...st];
			const prevCursor = next.pop() ?? null;
			setCursor(prevCursor);
			return next;
		});
	}

	function nextPage(): void {
		setCursorStack((st) => [...st, cursor]);
		setCursor(nextCursor);
	}

	// Fetch
	useEffect(() => {
		async function run() {
			if (!semester?.id || !weeklyWorkupId) return;

			setLoading(true);
			setError(null);

			try {
				const resp = await getSubmissionsForWeek({
					semesterId: semester.id,
					weekId: weeklyWorkupId,
					limit,
					cursor,
				});

				setItems(resp.submissions ?? []);
				setNextCursor(resp.cursor ?? null);
			} catch (e) {
				setError(errMsg(e));
				setItems([]);
				setNextCursor(null);
			} finally {
				setLoading(false);
			}
		}

		void run();
	}, [semester?.id, weeklyWorkupId, limit, cursor]);

	const actionsDisabled = loading || !hasSemester || !weeklyWorkupId;

	return {
		weeklyWorkupId,
		selectedWeek,
		setWeek,

		limit,
		setLimit,

		items,
		loading,
		error,

		canPrev,
		canNext,
		prevPage,
		nextPage,

		summaryText,
		weekMeta,

		actionsDisabled,
	};
}
