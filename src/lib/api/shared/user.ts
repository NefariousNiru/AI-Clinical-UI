// file: src/lib/api/shared/user.ts

import { ME, PROFILE } from "../../constants/urls";
import { MeResponse, UserProfile } from "../../types/user";
import { http } from "../http";

/**
 * GET /api/v1/shared/user/me
 *
 * Returns the current user's identity/role.
 * Uses zod to validate the server response.
 */
export async function me() {
	const raw = await http.get<unknown>(ME);
	return MeResponse.parse(raw);
}

/**
 * GET /api/v1/shared/user/profile
 *
 * Returns the current user's profile
 * Uses zod to validate the server response.
 */
export async function userProfile() {
	const raw = await http.get<unknown>(PROFILE);
	return UserProfile.parse(raw);
}
