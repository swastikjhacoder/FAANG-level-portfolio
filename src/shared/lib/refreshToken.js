export const refreshAccessToken = async () => {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.success) return null;

    return data.accessToken;
  } catch {
    return null;
  }
};
