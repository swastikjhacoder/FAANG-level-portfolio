"use client";

import { useEffect, useState } from "react";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch("/api/v1/profile/me");
        const json = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch profile");
        }

        setProfile(json.data);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    profile,
    loading,
    error,
  };
};
