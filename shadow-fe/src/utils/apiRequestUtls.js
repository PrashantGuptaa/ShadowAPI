import axios from "axios";

class ApiRequestUtils {
  async get(url, params = {}, headers = {}) {
    try {
      const response = await axios.get(url, {
        params: params,
        headers: {
          "Content-Type": "application/json",
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

export default new ApiRequestUtils();
