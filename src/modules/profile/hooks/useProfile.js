"use client";

import { secureFetch } from "@/shared/lib/secureFetch";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export const useProfile = () => {
  const { hydrated, isAuthenticated } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const json = await secureFetch("/api/v1/profile/me");

        if (!isMounted) return;

        setProfile(json.data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error("Profile fetch failed:", err);
        setError(err);
        setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [hydrated, isAuthenticated]);

  return {
    profile,
    loading,
    error,
  };
};
