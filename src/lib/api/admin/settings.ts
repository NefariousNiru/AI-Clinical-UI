// file: src/lib/api/admin/settings.ts

import { http } from "../http";
import { ADMIN_MRP_TOOL } from "../../constants/urls";

/**
 * GET /api/v1/admin/settings/mrp_tool_status
 * Backend returns a bare boolean (no JSON envelope).
 */
export async function fetchMrpToolStatus(): Promise<boolean> {
    const raw = await http.get<unknown>(ADMIN_MRP_TOOL);

    if (typeof raw === "boolean") {
        return raw;
    }

    // Be defensive in case the backend ever returns "true"/"false" as text
    if (typeof raw === "string") {
        const trimmed = raw.trim().toLowerCase();
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
    }

    throw new Error("Unexpected MRP tool status payload");
}

/**
 * POST /api/v1/admin/settings/mrp_tool_status
 * Backend toggles the flag and returns 200 with no body.
 */
export async function toggleMrpToolStatus(): Promise<void> {
    // Empty object body is usually safe even if backend ignores it
    await http.post<unknown>(ADMIN_MRP_TOOL, {});
}
