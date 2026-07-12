import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// 🔥 Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Endpoints that should never trigger a silent-refresh attempt on 401
const NO_REFRESH_URLS = ["/auth/login", "/auth/admin/refresh-token"];

// checkPermission's two possible messages — either one means this session has
// no valid admin authority (wrong role or missing permission) and a token
// refresh can't fix that. Rather than let the raw backend message surface as
// a confusing "technical" error, treat it the same as an expired session.
const AUTH_FAILURE_MESSAGES = ["Admin only", "Permission denied"];

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const redirectToLogin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// 🔹 401 -> silent refresh -> retry once, so admin sessions longer than the
// 15-minute access token lifetime don't silently start failing every request.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const message = error.response?.data?.message;

    const isExcluded = NO_REFRESH_URLS.some((u) => url.includes(u));

    // A 403 here means the token is structurally valid but doesn't belong to
    // a valid admin session — no amount of refreshing fixes that, so just
    // force a clean re-login instead of showing the raw error on the page.
    if (status === 403 && AUTH_FAILURE_MESSAGES.includes(message)) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (status === 401 && !isExcluded && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        API.post("/auth/admin/refresh-token")
          .then((res) => {
            const newToken = res.data?.data?.token;
            localStorage.setItem("token", newToken);
            isRefreshing = false;
            onRefreshed(newToken);
          })
          .catch(() => {
            isRefreshing = false;
            const subscribers = refreshSubscribers;
            refreshSubscribers = [];
            subscribers.forEach((cb) => cb(null));
            redirectToLogin();
          });
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(API(originalRequest));
        });
      });
    }

    if (status === 401 && !isExcluded) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default API;
