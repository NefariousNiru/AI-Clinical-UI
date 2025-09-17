// src/lib/localSession.ts
import type { StudentSubmission, ProblemFeedbackList } from "../types/admin"

const KEY = "aiClinicalAdmin:sessions"

export type SavedSession = {
  id: number           // epoch ms (also used as sort key)
  createdAt: number    // same as id
  model: string
  systemPrompt: string
  submissionId: number
  submission: StudentSubmission
  feedback: ProblemFeedbackList
}

function read(): SavedSession[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as SavedSession[]
    if (!Array.isArray(arr)) return []
    // sort newest first
    return [...arr].sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

function write(all: SavedSession[]) {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getAllSessions(): SavedSession[] {
  return read()
}

export function saveSession(input: Omit<SavedSession, "id" | "createdAt">): SavedSession {
  const now = Date.now()
  const session: SavedSession = { id: now, createdAt: now, ...input }
  const all = read()
  write([session, ...all])
  // notify listeners (drawer) to refresh
  window.dispatchEvent(new Event("local-sessions:changed"))
  return session
}

export function deleteSession(id: number): void {
  const next = read().filter(s => s.id !== id)
  write(next)
  window.dispatchEvent(new Event("local-sessions:changed"))
}

export function downloadSession(s: SavedSession) {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const ts = new Date(s.createdAt).toISOString().replace(/[:.]/g, "-")
  a.download = `session-${ts}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
