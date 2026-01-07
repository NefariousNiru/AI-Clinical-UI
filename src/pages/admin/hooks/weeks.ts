// file: src/pages/admin/hooks/weekly_workup.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../../lib/api/http";
import {
	createWeeklyWorkup,
	getWeeklyWorkup,
	listWeeklyWorkupsForSemester,
	updateWeeklyWorkup,
} from "../../../lib/api/admin/weekly_workup.ts";
import { getAllRubricIds } from "../../../lib/api/admin/rubric";
import type {
	WeeklyWorkupCreateRequest,
	WeeklyWorkupDetail,
	WeeklyWorkupListItem,
} from "../../../lib/types/weeks";

function errMsg(e: unknown): string {
	if (e instanceof ApiError) return e.message;
	if (e instanceof Error) return e.message;
	return "Something went wrong.";
}

export function useWeeklyWorkups(semesterId: number | null) {
	const [weeks, setWeeks] = useState<WeeklyWorkupListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!semesterId) {
			setWeeks([]);
			setError(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const xs = await listWeeklyWorkupsForSemester(semesterId);
			setWeeks(xs);
		} catch (e) {
			setError(errMsg(e));
		} finally {
			setLoading(false);
		}
	}, [semesterId]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return { weeks, loading, error, refresh };
}

export function useWeeklyWorkupDetail(weekId: number | null) {
	const [detail, setDetail] = useState<WeeklyWorkupDetail | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!weekId) {
			setDetail(null);
			setError(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const d = await getWeeklyWorkup(weekId);
			setDetail(d);
		} catch (e) {
			setError(errMsg(e));
		} finally {
			setLoading(false);
		}
	}, [weekId]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return { detail, loading, error, refresh };
}

export function useWeeklyWorkupMutations() {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const create = useCallback(async (payload: WeeklyWorkupCreateRequest) => {
		setSaving(true);
		setError(null);
		try {
			await createWeeklyWorkup(payload);
		} catch (e) {
			setError(errMsg(e));
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	const update = useCallback(async (weekId: number, payload: WeeklyWorkupCreateRequest) => {
		setSaving(true);
		setError(null);
		try {
			await updateWeeklyWorkup(weekId, payload);
		} catch (e) {
			setError(errMsg(e));
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	return { create, update, saving, error };
}

export function useRubricIdPager(patientLastName: string, limit = 20) {
	const [offset, setOffset] = useState(0);
	const [ids, setIds] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canPrev = offset > 0;
	const canNext = ids.length === limit;

	const pageLabel = useMemo(() => {
		const page = Math.floor(offset / limit) + 1;
		return `Page ${page}`;
	}, [offset, limit]);

	// Reset paging whenever last name changes
	useEffect(() => {
		setOffset(0);
		setIds([]);
		setError(null);
		setLoading(false);
	}, [patientLastName]);

	const fetchPage = useCallback(async () => {
		if (!patientLastName.trim()) {
			setIds([]);
			setError(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const xs = await getAllRubricIds(patientLastName.trim(), limit, offset);
			setIds(xs);
		} catch (e) {
			setError(errMsg(e));
			setIds([]);
		} finally {
			setLoading(false);
		}
	}, [patientLastName, limit, offset]);

	useEffect(() => {
		void fetchPage();
	}, [fetchPage]);

	const prev = useCallback(() => {
		if (!canPrev) return;
		setOffset((x) => Math.max(0, x - limit));
	}, [canPrev, limit]);

	const next = useCallback(() => {
		if (!canNext) return;
		setOffset((x) => x + limit);
	}, [canNext]);

	const reset = useCallback(() => {
		setOffset(0);
	}, []);

	return { ids, loading, error, offset, limit, canPrev, canNext, prev, next, reset, pageLabel };
}
