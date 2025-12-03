// file: src/lib/types/auth.ts

import { z } from "zod";

/**
 * UGA-only email + strong password for login.
 * but that is fine for client-side validation.
 */
export const LoginRequest = z.object({
    email: z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
        .endsWith("@uga.edu", { message: "Email must end with @uga.edu" }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
});

export type LoginRequest = z.infer<typeof LoginRequest>;
