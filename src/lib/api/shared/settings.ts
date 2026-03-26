// file: src/lib/api/shared/settings.ts

import { http } from "../http.ts";
import { SHARED_MRP_TOOL } from "../../constants/urls.ts";

/**
 * GET /api/v1/admin/settings/mrp_tool_status
 * Backend returns a bare boolean (no JSON envelope).
 */
export async function fetchMrpToolStatus(): Promise<boolean> {
	const raw = await http.get<unknown>(SHARED_MRP_TOOL);
	if (typeof raw === "boolean") {
		return raw;
	}
	if (typeof raw === "string") {
		const trimmed = raw.trim().toLowerCase();
		if (trimmed === "true") return true;
		if (trimmed === "false") return false;
	}
	throw new Error("Unexpected MRP tool status payload");
}
