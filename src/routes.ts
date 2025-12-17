// file: src/routes.ts

/**
 * Top-level routes (max depth: 1 path segments)
 *
 * Only include routes up to 1 level of hierarchy from the root path.
 *
 * Examples:
 * - ✅ Allowed: `/`, `/maps`
 * - ❌ Not allowed: `/maps/india/` or `/maps/usa/georgia/` (too deep)
 *
 * In other words: include at most 1 non-empty path segments.
 */

export const BASE_AUTO = "/"
export const AUTH = "/auth"
export const STUDENT = "/student"
export const ADMIN = "/admin"




