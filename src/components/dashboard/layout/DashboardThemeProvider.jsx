"use client";

import { useEffect } from "react";
import { useDashboardThemeStore } from "@/store/useDashboardThemeStore";

export default function DashboardThemeProvider({ children }) {
  const theme = useDashboardThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}
