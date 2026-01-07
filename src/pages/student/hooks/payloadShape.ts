// file: src/pages/student/hooks/payloadShape.ts

import { makeEmptyPatientInfo, type PatientInfo } from "../../../lib/types/studentSubmission";

type AnyObj = Record<string, any>;

function isObj(v: unknown): v is AnyObj {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merge `incoming` into a full PatientInfo template so every key exists.
 * - Keeps template keys even if incoming is {} or missing them.
 * - For arrays, prefers incoming array if provided.
 */
export function fillPatientInfoShape(incoming: Partial<PatientInfo> | undefined): PatientInfo {
	const base = makeEmptyPatientInfo();

	const merge = (tmpl: any, inc: any): any => {
		if (Array.isArray(tmpl)) {
			return Array.isArray(inc) ? inc : tmpl;
		}
		if (!isObj(tmpl)) {
			return inc !== undefined ? inc : tmpl;
		}

		const out: AnyObj = { ...tmpl };
		const incObj = isObj(inc) ? inc : {};

		for (const k of Object.keys(out)) {
			out[k] = merge(out[k], incObj[k]);
		}

		// if backend adds extra keys we don't know about, keep them
		for (const k of Object.keys(incObj)) {
			if (!(k in out)) out[k] = incObj[k];
		}

		return out;
	};

	return merge(base, incoming) as PatientInfo;
}

/**
 * Convert undefined -> null recursively so JSON.stringify keeps keys.
 * Keeps arrays, objects, primitives. Does not invent missing keys.
 */
export function undefinedToNullDeep<T>(value: T): T {
	const walk = (v: any): any => {
		if (v === undefined) return null;
		if (v === null) return null;
		if (Array.isArray(v)) return v.map(walk);
		if (isObj(v)) {
			const out: AnyObj = {};
			for (const k of Object.keys(v)) out[k] = walk(v[k]);
			return out;
		}
		return v;
	};

	return walk(value);
}
