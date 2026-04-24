import { refreshAccessToken } from "./refreshToken";

let refreshPromise = null;
let csrfInitialized = false;
let isRedirecting = false;

const requestCache = new Map();

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
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
    cache: "no-store",
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

  const isCacheable =
    method === "GET" && !url.includes("/profile") && !url.includes("/auth");

  if (isCacheable && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    }

    const isFormData = options.body instanceof FormData;
    const csrfToken = getCsrfToken();
    const token = getAccessToken();

    const config = {
      credentials: "include",
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    };

    let response = await fetch(url, config);

    const isAuthRoute =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout") ||
      url.includes("/api/csrf");

    if (response.status === 401 && !isAuthRoute) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .then((newToken) => {
            if (newToken) {
              setAccessToken(newToken);
              return true;
            }
            return false;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const success = await refreshPromise;

      if (!success) {
        if (typeof window !== "undefined" && !isRedirecting) {
          isRedirecting = true;
          window.location.replace("/login");
        }

        throw new Error("SESSION_EXPIRED");
      }

      const retryToken = getAccessToken();

      response = await fetch(url, {
        ...config,
        headers: {
          ...config.headers,
          ...(retryToken ? { Authorization: `Bearer ${retryToken}` } : {}),
        },
      });

      if (response.status === 401) {
        if (typeof window !== "undefined" && !isRedirecting) {
          isRedirecting = true;
          window.location.replace("/login");
        }

        throw new Error("SESSION_EXPIRED");
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

  if (isCacheable) {
    requestCache.set(cacheKey, fetchPromise);
    setTimeout(() => requestCache.delete(cacheKey), 5000);
  }

  return fetchPromise;
};
