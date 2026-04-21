export const requestWithCsrf = async (url, method = "GET", body = null) => {
  const isWriteOperation = ["POST", "PATCH", "PUT", "DELETE"].includes(method);
  const isFormData = body instanceof FormData;

  const getCsrfToken = async () => {
    const res = await fetch("/api/csrf", {
      credentials: "include",
      cache: "no-store",
    });

    const data = await res.json();

    await new Promise((r) => setTimeout(r, 30));

    return data.csrfToken;
  };

  const makeRequest = async (csrfToken) => {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        ...(isWriteOperation ? { "x-csrf-token": csrfToken } : {}),
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      },
      body:
        method === "GET" || method === "DELETE"
          ? null
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response (status ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}: ${data?.message || "Request failed"}`,
      );
    }

    return data;
  };

  try {
    if (!isWriteOperation) {
      return await makeRequest(null);
    }

    let csrfToken = await getCsrfToken();
    return await makeRequest(csrfToken);
  } catch (err) {
    if (isWriteOperation) {
      const retryToken = await getCsrfToken();
      return await makeRequest(retryToken);
    }

    throw err;
  }
};
