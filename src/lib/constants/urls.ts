// file: src/lib/constants/urls.ts

const API_BASE_V1 = "/api/v1";

// Public endpoints ------------------

// Public Auth
const PUBLIC_AUTH_BASE =  API_BASE_V1 + "/public/auth";
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
export const SHARED_MRP_TOOL = SHARED_SETTINGS_BASE + "/mrp_tool_status"


// Admin Endpoints ---------------------

// Admin Test
const ADMIN_TEST_BASE = API_BASE_V1 +  "/admin/test";
export const ADMIN_TEST_POPULATE_UI = ADMIN_TEST_BASE + "/populate_ui";
export const ADMIN_TEST_SUBMISSION = ADMIN_TEST_BASE + "/submission";
export const ADMIN_TEST_CHAT = ADMIN_TEST_BASE + "/chat";

// Admin Rubric Base
const ADMIN_RUBRIC_BASE = API_BASE_V1 + "/admin/rubric";
export const ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE = ADMIN_RUBRIC_BASE + "/search"

// Admin Student Base
const ADMIN_STUDENT_BASE = API_BASE_V1 + "/admin/student"; 
export const ADMIN_STUDENT_ROSTER = ADMIN_STUDENT_BASE + "/roster";
export const ADMIN_DISABLE_SEMESTER = ADMIN_STUDENT_BASE + "/disable/semester";
export const ADMIN_DISABLE_USER = ADMIN_STUDENT_BASE + "/disable/user";
export const ADMIN_NOTIFY_ACCOUNT = ADMIN_STUDENT_BASE + "/notify/account";
export const ADMIN_NOTIFY_ENROLLMENT = ADMIN_STUDENT_BASE + "/notify/enrollment";

// Admin Disease
export const ADMIN_ADD_DISEASE = "/api/v1/admin/disease"

// Admin Settings Base
const ADMIN_SETTINGS_BASE = API_BASE_V1 + "/admin/settings";
export const ADMIN_MRP_TOOL = ADMIN_SETTINGS_BASE + "/mrp_tool_status"

// Admin Semester
export const ADMIN_SEMESTER_BASE = API_BASE_V1 + "/admin/semester"
export const ADMIN_ALL_SEMESTER = ADMIN_SEMESTER_BASE + "/all"
