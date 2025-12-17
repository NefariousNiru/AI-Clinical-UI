// file: src/lib/utils/functions.ts

import type {NewRosterStudent} from "../types/roster.ts";
import type {Semester} from "../types/semester.ts";

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
 * Convert a Unix timestamp (seconds since epoch) into an ISO calendar date string in UTC.
 *
 * - Output format: `YYYY-MM-DD`
 * - Uses UTC (not local time).
 *
 * @param unixSeconds - Unix timestamp in seconds.
 * @returns ISO date string (UTC) in `YYYY-MM-DD` format.
 */
export function unixToIsoDate(unixSeconds: number): string {
    // YYYY-MM-DD in UTC
    return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

/**
 * Convert an ISO calendar date string (`YYYY-MM-DD`) into a Unix timestamp (UTC start of day).
 *
 * - Interprets the date as UTC midnight at the start of that day: `00:00:00Z`.
 *
 * @param dateStr - ISO date string in `YYYY-MM-DD` format.
 * @returns Unix timestamp in seconds for `YYYY-MM-DDT00:00:00Z`.
 */
export function isoDateToUnixStart(dateStr: string): number {
    // dateStr is YYYY-MM-DD
    const [y, m, d] = dateStr.split("-").map((x) => Number(x));
    return Math.floor(Date.UTC(y, m - 1, d, 0, 0, 0) / 1000);
}

/**
 * Convert an ISO calendar date string (`YYYY-MM-DD`) into a Unix timestamp near the end of that day (UTC).
 *
 * - This implementation returns `23:50:00Z` (not `23:59:59Z`).
 * - If you meant "inclusive end-of-day", consider using `23:59:59Z` instead.
 *
 * @param dateStr - ISO date string in `YYYY-MM-DD` format.
 * @returns Unix timestamp in seconds for `YYYY-MM-DDT23:50:00Z`.
 */
export function isoDateToUnixEnd(dateStr: string): number {
    const [y, m, d] = dateStr.split("-").map((x) => Number(x));
    return Math.floor(Date.UTC(y, m - 1, d, 23, 50, 0) / 1000);
}

/**
 * Format a Unix timestamp (seconds) as a short date string.
 *
 * - Currently identical to `unixToIsoDate` (UTC `YYYY-MM-DD`).
 *
 * @param unixSeconds - Unix timestamp in seconds.
 * @returns ISO date string (UTC) in `YYYY-MM-DD` format.
 */
export function fmtDateShort(unixSeconds: number): string {
    return unixToIsoDate(unixSeconds);
}
