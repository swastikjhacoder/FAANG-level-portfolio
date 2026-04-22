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

function isColorDark(hex) {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);

  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

export default function ThemeProvider({ children }) {
  const { background, foreground } = useThemeStore();
  const isMounted = useIsMounted();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--bg-color", background);
    root.style.setProperty("--text-color", foreground);

    if (isColorDark(background)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [background, foreground]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      {children}
    </div>
  );
}
