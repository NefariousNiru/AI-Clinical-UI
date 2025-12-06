// src/lib/localSession.ts

import type { TestSubmission } from "./types/test.ts"
import type {ProblemFeedbackList} from "./types/feedback.ts";
import {LOCAL_STORAGE_TEST_SESSION_KEY} from "./constants/localStorageKeys.ts";
import {downloadJSON} from "./functions.ts";

const KEY = LOCAL_STORAGE_TEST_SESSION_KEY

export type SavedSession = {
    id: number           // epoch ms (also used as sort key)
    createdAt: number    // same as id
    model: string
    systemPrompt: string
    submissionId: number
    submission: TestSubmission
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
    const ts = new Date(s.createdAt).toISOString().replace(/[:.]/g, "-")
    let filename : string = `session-${ts}.json`
    downloadJSON(JSON.stringify(s), filename)
}
