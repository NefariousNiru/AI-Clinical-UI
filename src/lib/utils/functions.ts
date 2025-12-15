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
 * Type guard for plain JSON-like objects (non-null, non-array). HELPER
 *
 * @param v - Value to test.
 * @returns True if `v` is a plain object record.
 */
function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Convert a key from snake_case to camelCase.
 * If the key is already camelCase (no underscores), it is returned unchanged.
 *
 * @param k - Input object key.
 * @returns Normalized camelCase key.
 */
function toCamelKey(k: string): string {
    // snake_case -> camelCase
    if (k.includes("_")) {
        return k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    }
    return k;
}

/**
 * Explicit key aliases for fields that either:
 * - are common snake_case variants in rubric JSON, or
 * - do not map cleanly via generic snake->camel conversion.
 */
const KEY_ALIASES: Record<string, string> = {
    rubric_id: "rubricId",
    rubric_version: "rubricVersion",
    schema_version: "schemaVersion",
    scoring_invariants: "scoringInvariants",
    contraindications_policy: "contraindicationsPolicy",
    evidence_keys: "evidenceKeys",
    non_scored_clinical_notes: "nonScoredClinicalNotes",
    max_points: "maxPoints",
    group_id: "groupId",
    select_k: "selectK",
    award_points: "awardPoints",
    unit_equivalents: "unitEquivalents",
    require_section_block_sums_match: "requireSectionBlockSumsMatch",
};

/**
 * Normalize a JSON key to camelCase using explicit aliases first,
 * then falling back to snake_case -> camelCase conversion.
 *
 * @param k - Raw input key.
 * @returns Camel-cased key.
 */
function normalizeKey(k: string): string {
    return KEY_ALIASES[k] ?? toCamelKey(k);
}


/**
 * Recursively normalize a rubric JSON payload to camelCase keys.
 *
 * Behavior:
 * - Arrays: maps each element recursively.
 * - Objects: converts each key to camelCase (alias-aware) and recurses into values.
 * - Primitives: returned as-is.
 *
 * @param input - Any JSON-like value.
 * @returns A structurally identical value with object keys normalized to camelCase.
 */
export function normalizeRubricJsonToCamel(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(normalizeRubricJsonToCamel);
    if (!isObject(input)) return input;

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
        out[normalizeKey(k)] = normalizeRubricJsonToCamel(v);
    }
    return out;
}
