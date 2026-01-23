// file: src/lib/constants/urls.ts

const API_BASE_V1 = "/api/v1";

// Public endpoints ------------------

// Public Auth
const PUBLIC_AUTH_BASE = API_BASE_V1 + "/public/auth";
export const AUTH_LOGIN = PUBLIC_AUTH_BASE + "/login";
export const AUTH_LOGOUT = PUBLIC_AUTH_BASE + "/logout";
export const AUTH_ACCOUNT_ACTIVATE = PUBLIC_AUTH_BASE + "/activate/account";
export const AUTH_ENROLLMENT_ACTIVATE = PUBLIC_AUTH_BASE + "/activate/enrollment";

// Shared endpoints ------------------

// Shared User
const SHARED_USER_BASE = API_BASE_V1 + "/shared/user";
export const ME = SHARED_USER_BASE + "/me";
export const PROFILE = SHARED_USER_BASE + "/profile";

// Shared Settings
const SHARED_SETTINGS_BASE = API_BASE_V1 + "/shared/settings";
export const SHARED_MRP_TOOL = SHARED_SETTINGS_BASE + "/mrp_tool_status";

// Student
const SHARED_STUDENT_BASE = API_BASE_V1 + "/shared/student";
export const STUDENT_WEEKS = SHARED_STUDENT_BASE + "/weeks";
export const STUDENT_MRP_FORM_DATA = SHARED_STUDENT_BASE + "/mrp_form";
export const STUDENT_SUBMISSION = SHARED_STUDENT_BASE + "/submission";
export const STUDENT_FEEDBACK = SHARED_STUDENT_BASE + "/feedback";

// Disease
export const DISEASE_SEARCH = API_BASE_V1 + "/shared/disease";

// Admin Endpoints ---------------------

// Admin Test
const ADMIN_TEST_BASE = API_BASE_V1 + "/admin/test";
export const ADMIN_TEST_POPULATE_UI = ADMIN_TEST_BASE + "/populate_ui";
export const ADMIN_TEST_SUBMISSION = ADMIN_TEST_BASE + "/submission";
export const ADMIN_TEST_CHAT = ADMIN_TEST_BASE + "/chat";

// Admin Rubric Base
export const ADMIN_RUBRIC_BASE = API_BASE_V1 + "/admin/rubric";
export const ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE = ADMIN_RUBRIC_BASE + "/search";
export const ADMIN_RUBRIC_IDS = ADMIN_RUBRIC_BASE + "/ids";
export const ADMIN_RUBRIC_ALL_PATIENTS = ADMIN_RUBRIC_BASE + "/patients";

// Admin Student Base
const ADMIN_ROSTER_BASE = API_BASE_V1 + "/admin/roster";
export const ADMIN_STUDENT_ROSTER = ADMIN_ROSTER_BASE;
export const ADMIN_DISABLE_SEMESTER = ADMIN_ROSTER_BASE + "/disable/semester";
export const ADMIN_DISABLE_USER = ADMIN_ROSTER_BASE + "/disable/user";
export const ADMIN_NOTIFY_ACCOUNT = ADMIN_ROSTER_BASE + "/notify/account";
export const ADMIN_NOTIFY_ENROLLMENT = ADMIN_ROSTER_BASE + "/notify/enrollment";

// Admin Student Submission
export const ADMIN_STUDENT_SUBMISSION = API_BASE_V1 + "/admin/student_submission";
export const ADMIN_SUBMISSION_COMMENT = ADMIN_STUDENT_SUBMISSION + "/comment";
export const ADMIN_SUBMISSION_EXTEND_DEADLINE = ADMIN_STUDENT_SUBMISSION + "/extend";

// Admin Disease
export const ADMIN_DISEASE = API_BASE_V1 + "/admin/disease";

// Admin Settings Base
const ADMIN_SETTINGS_BASE = API_BASE_V1 + "/admin/settings";
export const ADMIN_MRP_TOOL = ADMIN_SETTINGS_BASE + "/mrp_tool_status";

// Admin Semester
export const ADMIN_SEMESTER_BASE = API_BASE_V1 + "/admin/semester";
export const ADMIN_ALL_SEMESTER = ADMIN_SEMESTER_BASE + "/all";

// Admin Weeks
export const ADMIN_WEEKLY_WORKUP_BASE = API_BASE_V1 + "/admin/weekly_workup";
export const ADMIN_WEEKLY_WORKUP_SEMESTER = ADMIN_WEEKLY_WORKUP_BASE + "/semester";
