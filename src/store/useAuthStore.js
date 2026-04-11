"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      hydrated: false,

      login: () => set({ isLoggedIn: true }),

      logout: () =>
        set({
          isLoggedIn: false,
        }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
