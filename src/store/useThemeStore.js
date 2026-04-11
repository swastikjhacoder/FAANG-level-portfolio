import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      background: "#0f172a",
      foreground: "#ffffff",

      setTheme: (bg, fg) =>
        set({
          background: bg,
          foreground: fg,
        }),
    }),
    {
      name: "theme-storage",
    },
  ),
);
