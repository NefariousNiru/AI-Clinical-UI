// file: src/lib/types/roster.ts

import {z} from "zod";
import {SemesterNameSchema} from "./semester";

export const NewRosterStudentSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
});
export type NewRosterStudent = z.infer<typeof NewRosterStudentSchema>;

export const RosterStudentSchema = z.object({
    name: z.string(),
    email: z.email(),
    userId: z.uuid(),
    enrollmentId: z.uuid(),
    isActiveSemester: z.boolean(),
    isActiveUser: z.boolean(),
});
export type RosterStudent = z.infer<typeof RosterStudentSchema>;

export const RosterResponseSchema = z.object({
    students: z.array(RosterStudentSchema),
});
export type RosterResponse = z.infer<typeof RosterResponseSchema>;

export const AddRosterRequestSchema = z.object({
    semesterName: SemesterNameSchema,
    semesterYear: z.string().regex(/^\d+$/),
    students: z.array(NewRosterStudentSchema).min(1),
});
export type AddRosterRequest = z.infer<typeof AddRosterRequestSchema>;

export const DisableSemesterRequestSchema = z.object({
    enrollmentIds: z.array(z.uuid()).min(1),
});
export type DisableSemesterRequest = z.infer<typeof DisableSemesterRequestSchema>;

export const NotifyActivationRequestSchema = z.object({
    userId: z.uuid(),
    enrollmentId: z.uuid(),
    email: z.email(),
    semesterName: SemesterNameSchema,
    semesterYear: z.string().regex(/^\d+$/),
});
export type NotifyActivationRequest = z.infer<typeof NotifyActivationRequestSchema>;
