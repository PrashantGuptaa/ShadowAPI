const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const REGISTER_ENDPOINT = `${API_BASE_URL}user/register`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}user/login`;
export const VERIFY_EMAIL_ENDPOINT = `${API_BASE_URL}user/verify-email`;
export const FETCH_RULES_ENDPOINT = (pageNum, pageSize) =>
  `${API_BASE_URL}rule/collection?pageNum=${pageNum}&pageSize=${pageSize}`;
export const SAVE_RULE_ENDPOINT = `${API_BASE_URL}rule/create`;
