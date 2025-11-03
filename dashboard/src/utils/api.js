import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor to normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message: error?.response?.data?.message || error?.message || "Network Error",
      status: error?.response?.status,
      original: error,
    };

    // Optionally show a single toast for network-level failures
    if (!error?.response) {
      // network error
      toast.error("Network Error: Could not reach the server");
    }

    return Promise.reject(normalized);
  }
);

export default api;
