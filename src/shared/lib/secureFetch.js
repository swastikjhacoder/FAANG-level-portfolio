import { useAuthStore } from "@/store/useAuthStore";
import { refreshAccessToken } from "./refreshToken";

let inMemoryAccessToken = null;
let refreshPromise = null;
let csrfInitialized = false;

const requestCache = new Map();

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

const getCsrfToken = () => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

const ensureCsrfToken = async () => {
  if (csrfInitialized) return;

  const existing = getCsrfToken();
  if (existing) {
    csrfInitialized = true;
    return;
  }

  await fetch("/api/csrf", {
    method: "GET",
    credentials: "include",
  });

  csrfInitialized = true;
};

const createError = (response, data) => {
  const error = new Error(
    data?.message || response.statusText || "Something went wrong",
  );

  error.status = response.status;
  error.code = data?.code || "UNKNOWN_ERROR";
  error.data = data?.data || null;

  return error;
};

export const secureFetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${url}`;

  if (method === "GET" && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    }

    const csrfToken = getCsrfToken();
    const isFormData = options.body instanceof FormData;

    let config = {
      credentials: "include",
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        ...(inMemoryAccessToken
          ? { Authorization: `Bearer ${inMemoryAccessToken}` }
          : {}),
        ...(options.headers || {}),
      },
    };

    let response = await fetch(url, config);

    if (response.status === 401) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        setAccessToken(newAccessToken);

        config = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };

        response = await fetch(url, config);
      } else {
        clearAccessToken();

        const { logout } = useAuthStore.getState();
        logout?.();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw new Error("Session expired");
      }
    }

    let data;

    try {
      data = await response.clone().json();
    } catch {
      data = null;
    }

    if (!response.ok || data?.success === false) {
      throw createError(response, data);
    }

    return data;
  })();

  if (method === "GET") {
    requestCache.set(cacheKey, fetchPromise);

    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, 5000);
  }

  return fetchPromise;
};
