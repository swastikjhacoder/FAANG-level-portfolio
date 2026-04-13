import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
        });

        return data;
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
