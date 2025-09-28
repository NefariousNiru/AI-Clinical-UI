// src/lib/http.ts
export class ApiError extends Error {
    status?: number
    data?: unknown
    constructor(message: string, status?: number, data?: unknown) {
        super(message)
        this.status = status
        this.data = data
    }
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!rawBaseUrl || typeof rawBaseUrl !== "string" || !/^https?:\/\//.test(rawBaseUrl)) {
    throw new Error(
        "Invalid or missing VITE_API_BASE_URL. " +
        "Set it in your .env file (must start with http:// or https://)."
    )
}


const BASE_URL = rawBaseUrl.replace(/\/+$/, "")

/* type guards and helpers */
function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null
}
async function parseBody(res: Response): Promise<unknown> {
    const ct = res.headers.get("content-type") || ""
    if (ct.includes("application/json")) {
        try { return await res.json() } catch { return null }
    }
    try { return await res.text() } catch { return null }
}
function pickErrorMessage(data: unknown, fallback: string): string {
    if (isObject(data)) {
        const keys = ["message", "detail", "error"]
        for (const k of keys) {
            const val = data[k]
            if (typeof val === "string") return val
        }
    }
    return fallback
}
function getCookie(name: string): string | null {
    const m = document.cookie.match(
        new RegExp("(?:^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)")
    )
    return m ? decodeURIComponent(m[1]) : null
}
function makeHeaders(body?: unknown): HeadersInit {
    const headers: Record<string, string> = {}
    if (body !== undefined && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
    }
    // Optional CSRF support if your backend expects it
    const csrf = getCookie("XSRF-TOKEN") || getCookie("csrftoken")
    if (csrf) headers["X-CSRF-Token"] = csrf
    return headers
}

type Method = "GET" | "POST" | "PUT" | "DELETE"

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const init: RequestInit = {
        method,
        credentials: "include", // cookie-based auth
        headers: makeHeaders(body)
    }
    if (body !== undefined) {
        init.body = body instanceof FormData ? body : JSON.stringify(body)
    }

    const res = await fetch(`${BASE_URL}${path}`, init)
    const data = await parseBody(res)

    if (!res.ok) {
        const msg = pickErrorMessage(data, res.statusText || "Request failed")
        throw new ApiError(msg, res.status, data)
    }
    // Caller narrows with zod at the service layer
    return data as T
}

export const http = {
    get: <T>(p: string) => request<T>("GET", p),
    post: <T>(p: string, b?: unknown) => request<T>("POST", p, b),
    put: <T>(p: string, b?: unknown) => request<T>("PUT", p, b),
    del: <T>(p: string) => request<T>("DELETE", p)
}
