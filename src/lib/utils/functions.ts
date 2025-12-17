// file: src/lib/utils/functions.ts

import type {NewRosterStudent} from "../types/roster.ts";
import type {Semester} from "../types/semester.ts";
import { Temporal } from "@js-temporal/polyfill";

/**
 * Title-case helper that drops the last segment after the final underscore.
 * @param input - The input disease name eg: "abc_def_gh" -> "Abc Def"
 */
export function titleizeDiseaseName(input: string): string {
    // Drop everything after the last underscore
    const trimmed = input.replace(/_[^_]*$/, "");

    return trimmed
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .split(" ")
        .filter((part) => part.trim().length > 0)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ");
}

/**
 * Capitalise first letter
 * @param str - The string to capitalise abc -> Abc
 */
export function capitalizeFirst(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Download JSON by passing a JSON string and filename
 * @param jsonString The JSON String
 * @param filename The filename of the file
 */
export function downloadJSON(jsonString: string, filename: string) {
    const blob = new Blob([jsonString], {
        type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.trim() || "submission.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * Normalize a Semester year value into a number.
 *
 * @param year - The year value from a Semester (number or numeric string).
 * @returns A numeric year. If parsing fails, returns the current calendar year.
 */
export function normalizeYear(year: Semester["year"]): number {
    if (typeof year === "number") return year;
    const parsed = Number(year);
    return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}

/**
 * Normalize an email string for consistent comparison/storage.
 *
 * @param s - Raw email input.
 * @returns The trimmed, lowercased email.
 */
export function normalizeEmail(s: string): string {
    return s.trim().toLowerCase();
}

/**
 * Check whether a string is a UGA email address.
 *
 * @param s - Email to validate.
 * @returns True if the email matches the pattern `<local>@uga.edu`, otherwise false.
 */
export function isUgaEmail(s: string): boolean {
    return /^[^\s@]+@uga\.edu$/.test(s);
}


/**
 * Deduplicate and sanitize a list of newly uploaded roster students.
 *
 * Rules:
 * - Normalizes emails (trim + lowercase) and names (trim).
 * - Keeps only non-empty names and valid @uga.edu emails.
 * - Dedupes by normalized email (first occurrence wins).
 *
 * @param xs - Raw parsed students (may include duplicates/invalid rows).
 * @returns Cleaned, deduped list of students.
 */
export function dedupeNewStudents(xs: NewRosterStudent[]): NewRosterStudent[] {
    const seen = new Set<string>();
    const out: NewRosterStudent[] = [];
    for (const x of xs) {
        const email = normalizeEmail(x.email);
        const name = x.name.trim();
        if (!name) continue;
        if (!isUgaEmail(email)) continue;
        if (seen.has(email)) continue;
        seen.add(email);
        out.push({name, email});
    }
    return out;
}

/**
 * Parse a simple CSV (name,email) into roster students.
 *
 * Supported format:
 * - With header: `name,email` (case-insensitive) in the first row
 * - Without header: data starts on the first row
 *
 * Notes:
 * - Rows with missing fields, empty names, or non-@uga.edu emails are skipped.
 * - This is a lightweight parser: it does not support quoted commas, escaped
 *   fields, or multi-column schemas.
 *
 * @param text - Raw CSV text.
 * @returns `{ students, error? }` where `error` is set when no valid rows exist.
 */
export function parseCsvToStudents(text: string): { students: NewRosterStudent[]; error?: string } {
    const raw = text.trim();
    if (!raw) return {students: [], error: "CSV is empty."};

    const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length === 0) return {students: [], error: "CSV is empty."};

    const first = lines[0].toLowerCase();
    const startIdx = first.includes("name") && first.includes("email") ? 1 : 0;

    const students: NewRosterStudent[] = [];
    for (let i = startIdx; i < lines.length; i += 1) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.length < 2) continue;

        const n = parts[0];
        const e = normalizeEmail(parts[1]);
        if (!n) continue;
        if (!isUgaEmail(e)) continue;

        students.push({name: n, email: e});
    }

    if (students.length === 0) {
        return {students: [], error: "No valid rows found. Expected: name,email with @uga.edu emails."};
    }

    return {students};
}

/**
 * Convert a Unix timestamp (seconds since epoch) to an ISO date string (YYYY-MM-DD)
 * in US Eastern Time (DST-aware, year-round) using the IANA zone "America/New_York".
 *
 * Notes:
 * - The same epoch second can map to different calendar dates in different timezones.
 * - This returns the calendar date as observed in Eastern Time, not UTC.
 * - Output is always exactly "YYYY-MM-DD".
 *
 * @param unixSeconds Unix timestamp in seconds.
 * @returns ISO date string in Eastern Time (YYYY-MM-DD).
 *
 * @example
 * // 2025-01-01T04:30:00Z is still 2024-12-31 in Eastern Time
 * unixToIsoDate(1735705800) // "2024-12-31" (ET)
 */
export function unixToIsoDate(unixSeconds: number): string {
    const inst = Temporal.Instant.fromEpochMilliseconds(unixSeconds * 1000);
    const zdt = inst.toZonedDateTimeISO("America/New_York");
    const y = String(zdt.year).padStart(4, "0");
    const m = String(zdt.month).padStart(2, "0");
    const d = String(zdt.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Convert an ISO date string (YYYY-MM-DD) to epoch seconds at the start of that day
 * in US Eastern Time (DST-aware, year-round) using the IANA zone "America/New_York".
 *
 * Semantics:
 * - Interprets the input date as a calendar date in Eastern Time.
 * - Returns the Unix timestamp (seconds) for 00:00:00 Eastern on that date.
 * - Works correctly regardless of the machine/browser timezone.
 *
 * @param dateStr ISO date string in the form "YYYY-MM-DD".
 * @returns Unix timestamp (seconds since 1970-01-01T00:00:00Z) for the start of day in ET.
 * @throws If `dateStr` is not a valid ISO date.
 */
export function isoDateToUnixStart(dateStr: string): number {
    const d = Temporal.PlainDate.from(dateStr);
    const zdt = d.toZonedDateTime({
        timeZone: "America/New_York",
        plainTime: Temporal.PlainTime.from("00:00:00"),
    });
    return Math.floor(zdt.epochMilliseconds / 1000);
}

/**
 * Convert an ISO date string (YYYY-MM-DD) to epoch seconds at the inclusive end of that day
 * in US Eastern Time (DST-aware, year-round) using the IANA zone "America/New_York".
 *
 * Semantics:
 * - Interprets the input date as a calendar date in Eastern Time.
 * - Returns the Unix timestamp (seconds) for 23:59:59 Eastern on that date.
 * - Computed as (start of next day in ET) minus 1 second to avoid DST edge cases.
 * - Works correctly regardless of the machine/browser timezone.
 *
 * @param dateStr ISO date string in the form "YYYY-MM-DD".
 * @returns Unix timestamp (seconds since 1970-01-01T00:00:00Z) for 23:59:59 in ET.
 * @throws If `dateStr` is not a valid ISO date.
 */
export function isoDateToUnixEnd(dateStr: string): number {
    const d = Temporal.PlainDate.from(dateStr);
    const startNext = d.add({ days: 1 }).toZonedDateTime({
        timeZone: "America/New_York",
        plainTime: Temporal.PlainTime.from("00:00:00"),
    });
    return Math.floor(startNext.epochMilliseconds / 1000) - 1;
}

