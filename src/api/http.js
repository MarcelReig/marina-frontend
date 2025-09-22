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
    const original = error?.config;
    const status = error?.response?.status;
    if (status === 401 && !original?._retry) {
      original._retry = true;
      const refreshToken = sessionStorage.getItem("refresh_token");
      if (refreshToken) {
        // try refresh
        return axios
          .post(`${getApiBase().replace(/\/$/, "")}/token/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          })
          .then((res) => {
            const newAccess = res?.data?.access_token;
            if (newAccess) {
              sessionStorage.setItem("token", newAccess);
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${newAccess}`;
              return http(original);
            }
            return Promise.reject(error);
          })
          .catch(() => {
            // fallthrough to logout
          });
      }
    }
    if (status === 401 || status === 403) {
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refresh_token");
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
