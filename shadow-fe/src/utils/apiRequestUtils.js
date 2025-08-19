import axios from "axios";

class ApiRequestUtils {
  async get(url, params = {}, headers = {}) {
    try {
      const response = await axios.get(url, {
        params: params,
        headers: {
          "Content-Type": "application/json",
          "Auth-Token": localStorage.getItem("authToken") || "",
          ...headers,
        },
      });
      return response;
    } catch (error) {
      console.error("Error in GET request:", error);
      throw error;
    }
  }
  async post(url, data = {}, headers = {}) {
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          "Auth-Token": localStorage.getItem("authToken") || "",
          ...headers,
        },
      });
      return response;
    } catch (error) {
      console.error("Error in POST request:", error);
      throw error;
    }
  }
  async put(url, data = {}, headers = {}) {
    try {
      const response = await axios.put(url, data, {
        headers: {
          "Content-Type": "application/json",
          "Auth-Token": localStorage.getItem("authToken") || "",
          ...headers,
        },
      });
      return response;
    } catch (error) {
      console.error("Error in PUT request:", error);
      throw error;
    }
  }
  async delete(url, params = {}, headers = {}) {
    try {
      const response = await axios.delete(url, {
        params: params,
        headers: {
          "Content-Type": "application/json",
          "Auth-Token": localStorage.getItem("authToken") || "",
          ...headers,
        },
      });
      return response;
    } catch (error) {
      console.error("Error in DELETE request:", error);
      throw error;
    }
  }
}

const apiRequestUtils = new ApiRequestUtils();

// Import endpoints
import {
  REGISTER_ENDPOINT,
  LOGIN_ENDPOINT,
  VERIFY_EMAIL_ENDPOINT,
  FORGOT_PASSWORD_ENDPOINT,
  RESET_PASSWORD_ENDPOINT,
  VALIDATE_AND_ISSUE_TOKEN_ENDPOINT,
  SAVE_RULE_ENDPOINT,
  FETCH_RULES_ENDPOINT,
  UPDATE_RULE_STATUS_ENDPOINT,
  FETCH_ACTIVE_RULES_ENDPOINT,
  FETCH_RULE_DETAILS_BY_ID_ENDPOINT,
  UPDATE_RULE_BY_ID_ENPOINT,
} from "./apiEndpoints";

// User Management APIs
export const registerAPI = (data) => {
  return apiRequestUtils.post(REGISTER_ENDPOINT, data);
};

export const loginAPI = (data) => {
  return apiRequestUtils.post(LOGIN_ENDPOINT, data);
};

export const verifyEmailAPI = (data) => {
  return apiRequestUtils.put(VERIFY_EMAIL_ENDPOINT, data);
};

export const forgotPasswordAPI = (data) => {
  return apiRequestUtils.post(FORGOT_PASSWORD_ENDPOINT, data);
};

export const resetPasswordAPI = (data) => {
  return apiRequestUtils.post(RESET_PASSWORD_ENDPOINT, data);
};

export const validateAndIssueTokenAPI = (data) => {
  return apiRequestUtils.get(VALIDATE_AND_ISSUE_TOKEN_ENDPOINT, data);
};

// Rule Management APIs
export const saveRuleAPI = (data) => {
  return apiRequestUtils.post(SAVE_RULE_ENDPOINT, data);
};

export const fetchRulesAPI = (pageNum, pageSize, type) => {
  return apiRequestUtils.get(FETCH_RULES_ENDPOINT(pageNum, pageSize, type));
};

export const updateRuleStatusAPI = (data) => {
  return apiRequestUtils.put(UPDATE_RULE_STATUS_ENDPOINT, data);
};

export const fetchActiveRulesAPI = () => {
  return apiRequestUtils.get(FETCH_ACTIVE_RULES_ENDPOINT);
};

export const fetchRuleDetailsByIdAPI = (ruleId) => {
  return apiRequestUtils.get(FETCH_RULE_DETAILS_BY_ID_ENDPOINT(ruleId));
};

export const updateRuleByIdAPI = (ruleId, data) => {
  return apiRequestUtils.put(UPDATE_RULE_BY_ID_ENPOINT(ruleId), data);
};

export default apiRequestUtils;
