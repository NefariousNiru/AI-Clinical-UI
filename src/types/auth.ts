// src/types/auth.ts
import { z } from "zod"

/** UGA-only email + strong password */
export const LoginRequest = z.object({
    email: z.email("Invalid email format")
        .regex(/^[A-Za-z0-9._%+-]+@uga\.edu$/, "Email must end with @uga.edu"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
})
export type LoginRequest = z.infer<typeof LoginRequest>

/** Role union */
export const Role = z.enum(["admin", "student"])
export type Role = z.infer<typeof Role>

/** /api/v1/me response */
export const MeResponse = z.object({
    id: z.uuid(),
    role: Role
})
export type MeResponse = z.infer<typeof MeResponse>
