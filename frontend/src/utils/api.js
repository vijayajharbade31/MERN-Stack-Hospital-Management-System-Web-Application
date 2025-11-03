import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message: error?.response?.data?.message || error?.message || "Network Error",
      status: error?.response?.status,
      original: error,
    };

    if (!error?.response) {
      toast.error("Network Error: Could not reach the server");
    }

    return Promise.reject(normalized);
  }
);

export default api;
