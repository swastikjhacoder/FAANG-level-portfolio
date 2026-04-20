export const postWithCsrf = async (url, body) => {
  const csrfRes = await fetch("/api/csrf", {
    credentials: "include",
  });

  const { csrfToken } = await csrfRes.json();

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
