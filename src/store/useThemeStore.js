import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      background: "#ffffff",
      foreground: "#0f172a",

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
