"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  clearAccessToken,
  setAccessToken,
  getAccessToken,
} from "@/shared/lib/secureFetch";
import { refreshAccessToken } from "@/shared/lib/refreshToken";

export default function AuthProvider({ children }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const hydrated = useAuthStore((s) => s.hydrated);

  // 🔹 Initialize auth on app load
  useEffect(() => {
    if (!hydrated) return;

    const initAuth = async () => {
      const token = getAccessToken();

      // If no token in memory → try refresh
      if (!token) {
        try {
          const newToken = await refreshAccessToken();

          if (newToken) {
            setAccessToken(newToken);
          } else {
            clearAccessToken();
          }
        } catch {
          clearAccessToken();
        }
      }
    };

    initAuth();
  }, [hydrated]);

  // 🔹 Mark Zustand store as hydrated
  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  return children;
}
