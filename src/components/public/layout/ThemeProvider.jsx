"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useSyncExternalStore } from "react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ThemeProvider({ children }) {
  const { background, foreground } = useThemeStore();
  const isMounted = useIsMounted();

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-color", background);
    document.documentElement.style.setProperty("--text-color", foreground);
  }, [background, foreground]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      {children}
    </div>
  );
}
