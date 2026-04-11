import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDashboardThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",

      setTheme: (theme) => {
        set({ theme });

        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.classList.toggle("dark", theme === "dark");
        }
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      },
    }),
    {
      name: "dashboard-theme",

      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          const root = document.documentElement;
          root.classList.toggle("dark", state.theme === "dark");
        }
      },
    },
  ),
);
