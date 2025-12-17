// file: src/lib/api/admin/settings.ts

import { http } from "../http";
import { ADMIN_MRP_TOOL } from "../../constants/urls";

/**
 * POST /api/v1/admin/settings/mrp_tool_status
 * Backend toggles the flag and returns 200 with no body.
 */
export async function toggleMrpToolStatus(): Promise<void> {
    await http.post<unknown>(ADMIN_MRP_TOOL, {});
}
