const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// User Management Endpoints
export const REGISTER_ENDPOINT = `${API_BASE_URL}user/register`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}user/login`;
export const VERIFY_EMAIL_ENDPOINT = `${API_BASE_URL}user/verify-email`;
export const FORGOT_PASSWORD_ENDPOINT = `${API_BASE_URL}user/forgot-password`;
export const RESET_PASSWORD_ENDPOINT = `${API_BASE_URL}user/reset-password`;
export const VALIDATE_AND_ISSUE_TOKEN_ENDPOINT = `${API_BASE_URL}user/me`;

// Google Authentication Endpoint
export const GOOGLE_AUTH_ENDPOINT = `${API_BASE_URL}auth/google`;
export const GOOGLE_CALLBACK_ENDPOINT = `${API_BASE_URL}auth/google/callback`;

// Rule Management Endpoints
export const FETCH_RULES_ENDPOINT = (pageNum, pageSize, type) =>
  `${API_BASE_URL}rule/collection?pageNum=${pageNum}&pageSize=${pageSize}&type=${type}`;
export const SAVE_RULE_ENDPOINT = `${API_BASE_URL}rule/create`;
export const UPDATE_RULE_STATUS_ENDPOINT = `${API_BASE_URL}rule/update-status`;
export const FETCH_ACTIVE_RULES_ENDPOINT = `${API_BASE_URL}rule/active-rules`;
export const FETCH_RULE_DETAILS_BY_ID_ENDPOINT = (ruleId) =>
  `${API_BASE_URL}rule/${ruleId}`;
export const UPDATE_RULE_BY_ID_ENPOINT = (ruleId) =>
  `${API_BASE_URL}rule/update/${ruleId}`;
