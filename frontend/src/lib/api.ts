import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const plainAxios = axios.create({ baseURL: API_BASE_URL });

type TokenPair = { access: string; refresh: string };
type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function getTokens(): TokenPair | null {
  const raw = localStorage.getItem("tokens");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<TokenPair>;
    if (
      typeof parsed?.access === "string" &&
      typeof parsed?.refresh === "string"
    ) {
      return { access: parsed.access, refresh: parsed.refresh };
    }
  } catch {
    // Ignore malformed storage and treat as logged out.
  }

  clearTokens();
  return null;
}

function setTokens(tokens: TokenPair) {
  localStorage.setItem("tokens", JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem("tokens");
}

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getTokens();

  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  } else {
    delete config.headers.Authorization; // Clear stale Authorization header
  }

  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens?.refresh) {
    throw new Error("No refresh token");
  }

  const res = await plainAxios.post<{ access: string; refresh?: string }>(
    "/api/token/refresh/",
    { refresh: tokens.refresh },
  );

  const newAccess = res.data.access;

  // If backend returns a rotated refresh token (ROTATE_REFRESH_TOKENS=True),
  // store it. Otherwise, keep the existing refresh token.
  const newRefresh = res.data.refresh ?? tokens.refresh;

  setTokens({ access: newAccess, refresh: newRefresh });

  return newAccess;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = (originalRequest?.url || "").toString();
    const isAuthRoute =
      url.includes("/api/token/") || url.includes("/api/token/refresh/");

    // If auth routes fail with 401, do not try to refresh on top of login/refresh.
    if (error.response?.status === 401 && isAuthRoute) {
      clearTokens();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) return reject(error);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newAccess = await refreshAccessToken();
        processQueue(newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (e) {
        processQueue(null);
        clearTokens();

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
    const res = await plainAxios.post<TokenPair>("/api/token/", {
      username,
      password,
    });
    setTokens(res.data);
    return res.data;
  },
  logout() {
    clearTokens();
  },
  getTokens,
};
