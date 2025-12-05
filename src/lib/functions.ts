// file: src/lib/functions.ts

/**
 * Title-case helper that drops the last segment after the final underscore.
 *
 * "abc_def_gh" -> "Abc Def"
 */
export function titleize(input: string): string {
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
