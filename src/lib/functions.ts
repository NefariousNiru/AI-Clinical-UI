// file: src/lib/functions.ts

/**
 * Basic title-case helper for slugs / rubric ids.
 *
 * "gout_flare" -> "Gout Flare"
 * "GOUT_FLARE" -> "Gout Flare"
 */
export function titleize(input: string): string {
  return input
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter((part) => part.trim().length > 0)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
