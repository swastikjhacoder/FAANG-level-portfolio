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

function hexToRgb(hex) {
  const c = hex.substring(1);
  const bigint = parseInt(c, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export default function ThemeProvider({ children }) {
  const { background, foreground } = useThemeStore();
  const isMounted = useIsMounted();

  useEffect(() => {
    const root = document.documentElement;

    const isDark = isColorDark(background);
    const { r, g, b } = hexToRgb(foreground);

    root.style.setProperty("--bg-color", background);
    root.style.setProperty("--text-color", foreground);

    root.style.setProperty("--text-primary", foreground);
    root.style.setProperty("--text-secondary", `rgba(${r}, ${g}, ${b}, 0.75)`);
    root.style.setProperty("--text-muted", `rgba(${r}, ${g}, ${b}, 0.6)`);

    root.style.setProperty(
      "--surface",
      isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    );

    root.style.setProperty(
      "--surface-strong",
      isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    );

    root.style.setProperty(
      "--border",
      isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    );

    root.style.setProperty(
      "--shadow",
      isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 8px 32px rgba(0,0,0,0.08)",
    );

    root.style.setProperty("--glass-bg", "var(--surface)");
    root.style.setProperty("--glass-border", "var(--border)");
    root.style.setProperty("--glass-shadow", "var(--shadow)");

    root.style.setProperty(
      "--chart-grid",
      isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    );

    if (isDark) {
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
