import axios from "axios";
import { getApiBase } from "./base";

const http = axios.create({
  baseURL: getApiBase(),
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Logout on 401/403 globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } catch (e) {}
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/auth") {
          window.location.replace("/auth");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default http;
