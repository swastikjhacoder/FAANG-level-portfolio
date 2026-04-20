export const requestWithCsrf = async (url, method = "GET", body = null) => {
  const isWriteOperation = ["POST", "PATCH", "PUT", "DELETE"].includes(method);

  let csrfToken = null;

  if (isWriteOperation) {
    const csrfRes = await fetch("/api/csrf", {
      credentials: "include",
    });

    const csrfJson = await csrfRes.json();
    csrfToken = csrfJson.csrfToken;
  }

  const isFormData = body instanceof FormData;

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
    throw new Error("Invalid server response (not JSON)");
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};
