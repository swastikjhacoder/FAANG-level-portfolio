"use client";

import { useState, useRef, useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

const bgOptions = ["#0f172a", "#ffffff", "#1e293b", "#facc15", "#0ea5e9"];
const fgOptions = ["#ffffff", "#000000", "#f1f5f9", "#1e293b"];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { setTheme, background, foreground } = useThemeStore();

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed top-1/2 right-6 -translate-y-1/2 z-50 flex flex-col items-end"
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-(--surface) text-(--text-color) px-4 py-2 rounded-full shadow-lg border border-(--glass-border)"
      >
        🎨
      </button>

      {open && (
        <div className="mt-3 w-64 p-4 rounded-2xl shadow-xl backdrop-blur-md bg-(--glass-bg) border border-(--glass-border)">
          <h3 className="text-sm font-semibold mb-2 text-(--text-color)">
            Background
          </h3>

          <div className="flex gap-2 flex-wrap mb-4">
            {bgOptions.map((bg) => (
              <div
                key={bg}
                onClick={() => setTheme(bg, foreground)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition ${
                  background === bg
                    ? "border-(--text-color)"
                    : "border-transparent"
                }`}
                style={{ background: bg }}
              />
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2 text-(--text-color)">
            Text
          </h3>

          <div className="flex gap-2 flex-wrap">
            {fgOptions.map((fg) => (
              <div
                key={fg}
                onClick={() => setTheme(background, fg)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition ${
                  foreground === fg
                    ? "border-(--text-color)"
                    : "border-transparent"
                }`}
                style={{ background: fg }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
