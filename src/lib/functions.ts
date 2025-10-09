// src/lib/functions.ts
export function titleize(s: string) {
    return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
}