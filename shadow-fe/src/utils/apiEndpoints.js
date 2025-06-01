 const API_BASE_URL = process.env.VITE_APP_API_BASE_URL;

export const REGISTER_ENDPOINT = `${API_BASE_URL}user/register`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}user/login`;
export const VERIFY_EMAIL_ENDPOINT = (token) => `${API_BASE_URL}user/verify-email?token=${token}`;