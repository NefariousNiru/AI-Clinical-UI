// file: src/routes.ts

// Top Level Routes
export const BASE_AUTO = "/";
export const AUTH = "/auth";
export const STUDENT = "/student";
export const ADMIN = "/admin";

// Sub Routes No Forward Slash
// Auth Endpoints start with /auth
export const AUTH_ACTIVATE = "activate";
export const AUTH_ACTIVATE_ACCOUNT = "account";
export const AUTH_ACTIVATE_ENROLLMENT = "enrollment";
export const AUTH_LOGIN = "login";
export const AUTH_INTRO = "intro";

// Admin Routes
export const ADMIN_WEEK = "week";
export const ADMIN_RUBRIC = "rubric";
export const ADMIN_STUDENTS = "students";
export const ADMIN_TESTS = "tests";
export const ADMIN_STATISTICS = "statistics";

// Student Routes
export const STUDENT_WORKUP = "workup";
