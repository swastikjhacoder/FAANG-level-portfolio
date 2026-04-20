export const refreshAccessToken = async () => {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();

    return data?.accessToken || null;
  } catch {
    return null;
  }
};
