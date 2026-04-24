import { refreshAccessToken } from "./refreshToken";

let inMemoryAccessToken = null;
let refreshPromise = null;
let csrfInitialized = false;

const requestCache = new Map();

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getToken = () => inMemoryAccessToken;

const isValidToken = (t) =>
  typeof t === "string" && t.trim() !== "" && t !== "undefined" && t !== "null";

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
    cache: "no-store",
  });

  await new Promise((r) => setTimeout(r, 20));

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

  const rawToken = getToken();
  const safeToken = isValidToken(rawToken) ? rawToken : null;

  const cacheKey = `${method}:${url}:${safeToken || "no-token"}`;

  if (method === "GET" && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    }

    const isFormData = options.body instanceof FormData;
    let csrfToken = getCsrfToken();

    let currentToken = getToken();

    if (isValidToken(currentToken) && isTokenExpired(currentToken)) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        setAccessToken(newToken);
        currentToken = newToken;
      } else {
        clearAccessToken();
        currentToken = null;
      }
    }

    const baseHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      ...(options.headers || {}),
    };

    if (isValidToken(currentToken)) {
      baseHeaders["authorization"] = `Bearer ${currentToken}`;
    }

    let config = {
      credentials: "include",
      ...options,
      headers: baseHeaders,
    };

    let response = await fetch(url, config);

    if (response.status === 401) {

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        clearAccessToken();

        if (typeof window !== "undefined") {
          const isOnLoginPage = window.location.pathname === "/login";

          if (!isOnLoginPage) {
            window.location.replace("/login");
          }
        }

        throw new Error("SESSION_EXPIRED");
      }

      setAccessToken(newAccessToken);

      const retryCsrfToken = getCsrfToken();

      const retryHeaders = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(retryCsrfToken ? { "x-csrf-token": retryCsrfToken } : {}),
        Authorization: `Bearer ${newAccessToken}`,
        ...(options.headers || {}),
      };

      const retryConfig = {
        credentials: "include",
        ...options,
        headers: retryHeaders,
      };

      response = await fetch(url, retryConfig);

      if (response.status === 401) {
        clearAccessToken();

        if (typeof window !== "undefined") {
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

  if (method === "GET") {
    requestCache.set(cacheKey, fetchPromise);
    setTimeout(() => requestCache.delete(cacheKey), 5000);
  }

  return fetchPromise;
};