import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://ticketing-portal-api.vercel.app"
    : "http://localhost:8001");

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

// Auth is handled entirely via httpOnly cookies set by the backend, so
// these clients never touch tokens directly - just forward cookies and
// attach the CSRF header Django expects on state-changing requests.
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function attachCsrfHeader(config: InternalAxiosRequestConfig) {
  const method = (config.method || "get").toLowerCase();
  if (UNSAFE_METHODS.has(method)) {
    const token = getCookie("csrftoken");
    if (token) config.headers["X-CSRFToken"] = token;
  }
  return config;
}

const plainAxios = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
plainAxios.interceptors.request.use(attachCsrfHeader);

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
api.interceptors.request.use(attachCsrfHeader);

let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

function processQueue(ok: boolean) {
  refreshQueue.forEach((cb) => cb(ok));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<void> {
  await plainAxios.post("/api/token/refresh/");
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = (originalRequest?.url || "").toString();
    const isAuthRoute = url.includes("/api/token/");

    // If auth routes fail with 401, do not try to refresh on top of login/refresh.
    if (error.response?.status === 401 && isAuthRoute) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((ok) => {
            if (!ok) return reject(error);
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        processQueue(true);
        return api(originalRequest);
      } catch (e) {
        processQueue(false);
        window.location.href = "/";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const auth = {
  async login(username: string, password: string) {
    // Ensure the CSRF cookie exists before the first unsafe request.
    await plainAxios.get("/api/csrf/");
    await plainAxios.post("/api/token/", { username, password });
  },
  async logout() {
    try {
      await plainAxios.post("/api/logout/");
    } catch {
      // Best-effort: cookies are httpOnly and will simply expire otherwise.
    }
  },
  async ensureCsrfCookie() {
    await plainAxios.get("/api/csrf/").catch(() => {});
  },
};
