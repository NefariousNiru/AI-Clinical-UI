// file: src/lib/types/user.ts

import { z } from "zod";

/** Role union (matches backend UserRole enum) */
export const Role = z.enum(["admin", "student"]);
export type Role = z.infer<typeof Role>;

/** /api/v1/shared/user/me response */
export const MeResponse = z.object({
    id: z.uuid(),
    role: Role,
});

export type MeResponse = z.infer<typeof MeResponse>;