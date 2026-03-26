// file: src/pages/admin/hooks/submissionAndDeadlines.ts

import type { WeeklyWorkupDropdownItem } from "../students/WeeklyWorkupDropdown.tsx";
import type { SubmissionView } from "../../../lib/types/studentDeadlines.ts";
import type { Semester } from "../../../lib/types/semester.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isoDateToUnixStart, unixToIsoDate } from "../../../lib/utils/functions.ts";
import {
	extendSubmissionDeadline,
	getSubmissionsForWeek,
} from "../../../lib/api/admin/studentDeadlines.ts";
import { errMsg } from "./rubric.ts";
import type { WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks.ts";
import { isViewOnly } from "../../student/hooks/routeToWorkup.ts";
import { Temporal } from "@js-temporal/polyfill";

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

export type ViewTarget = {
	weeklyWorkupId: number;
	enrollmentId: string;
	status: WeeklyWorkupStudentStatus;
	name: string;
};

export function useViewSubmissionModal() {
	const [open, setOpen] = useState(false);
	const [target, setTarget] = useState<ViewTarget | null>(null);

	const openFor = useCallback((it: SubmissionView): void => {
		if (!isViewOnly(it.status)) return;

		setTarget({
			weeklyWorkupId: it.workupId,
			enrollmentId: it.enrollmentId,
			status: it.status as WeeklyWorkupStudentStatus,
			name: it.name,
		});
		setOpen(true);
	}, []);

	const close = useCallback((): void => {
		setOpen(false);
		setTarget(null);
	}, []);

	return {
		open,
		target,
		openFor,
		close,
	};
}

export type ExtendTarget = {
	weekId: number;
	enrollmentId: string;
	name: string;
};

export function useExtendDeadlineModal() {
	const [open, setOpen] = useState(false);
	const [target, setTarget] = useState<ExtendTarget | null>(null);

	const openFor = useCallback((it: SubmissionView): void => {
		setTarget({
			weekId: it.workupId,
			enrollmentId: it.enrollmentId,
			name: it.name,
		});
		setOpen(true);
	}, []);

	const close = useCallback((): void => {
		setOpen(false);
		setTarget(null);
	}, []);

	return { open, target, openFor, close };
}

export const EXTEND_REASONS = [
	{ value: "medical_emergency", label: "Medical emergency" },
	{ value: "family_emergency", label: "Family emergency" },
	{ value: "mental_health_emergency", label: "Mental health emergency" },
	{ value: "essential_outage", label: "Power/Internet outage" },
	{ value: "inclement_weather", label: "Inclement weather" },
	{ value: "accessibility_accommodation", label: "Accessibility accommodation" },
	{ value: "technical_issue", label: "Technical issue (LMS / upload / system outage)" },
	{ value: "official_university_event", label: "Official university event / travel" },
	{ value: "other", label: "Other (specify)" },
] as const;

type ReasonKey = (typeof EXTEND_REASONS)[number]["value"];

type Args = {
	weekId: number;
	enrollmentId: string;
	onSuccess?: () => void | Promise<void>;
	onClose: () => void;
};

const OTHER_CAP = 100;

function getTomorrowIsoNY(): string {
	// input[type="date"] expects YYYY-MM-DD
	const now = Temporal.Now.zonedDateTimeISO("America/New_York");
	const tomorrow = now.add({ days: 1 }).toPlainDate();
	return tomorrow.toString();
}

export function useExtendDeadlineModalForm({ weekId, enrollmentId, onSuccess, onClose }: Args) {
	const [dateStr, setDateStr] = useState<string>("");
	const [reasonKey, setReasonKey] = useState<ReasonKey>("medical_emergency");
	const [otherTextRaw, setOtherTextRaw] = useState<string>("");

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const minDate = useMemo(() => getTomorrowIsoNY(), []);

	const isOther = reasonKey === "other";

	const otherText = useMemo(() => otherTextRaw.slice(0, OTHER_CAP), [otherTextRaw]);
	const otherRemaining = OTHER_CAP - otherText.length;

	const selectedReasonLabel = useMemo(() => {
		return EXTEND_REASONS.find((r) => r.value === reasonKey)?.label ?? "Other (specify)";
	}, [reasonKey]);

	const reasonFinal = useMemo(() => {
		if (!isOther) return selectedReasonLabel;
		const t = otherText.trim();
		return t.length > 0 ? `Other: ${t}` : "";
	}, [isOther, otherText, selectedReasonLabel]);

	const canSubmit =
		!saving &&
		dateStr.trim().length > 0 &&
		dateStr >= minDate && // string compare ok for YYYY-MM-DD
		(isOther ? otherText.trim().length > 0 : true) &&
		reasonFinal.trim().length > 0;

	async function submit(): Promise<void> {
		setError(null);

		if (!canSubmit) {
			setError("Pick a future date and provide a valid reason.");
			return;
		}

		const extendTimestamp = isoDateToUnixStart(dateStr);
		if (!Number.isFinite(extendTimestamp) || extendTimestamp <= 0) {
			setError("Invalid date. Try again.");
			return;
		}

		setSaving(true);
		try {
			await extendSubmissionDeadline({
				weekId,
				enrollmentId,
				extendTimestamp,
				reason: reasonFinal,
			});

			await onSuccess?.();
			onClose();
		} catch {
			setError(
				"Unable to extend deadline. Extension must be provided only after deadline has ended. Please try again.",
			);
		} finally {
			setSaving(false);
		}
	}

	return {
		// fields
		dateStr,
		setDateStr,
		minDate,

		reasonKey,
		setReasonKey,

		isOther,
		otherText,
		setOtherTextRaw, // pass raw setter; hook enforces cap via derived otherText
		otherRemaining,

		// ui state
		saving,
		error,
		setError,

		// derived
		canSubmit,

		// actions
		submit,
	};
}
