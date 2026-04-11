"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

const bgOptions = ["#0f172a", "#ffffff", "#1e293b", "#facc15", "#0ea5e9"];
const fgOptions = ["#ffffff", "#000000", "#f1f5f9", "#1e293b"];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { setTheme, background, foreground } = useThemeStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="bg-black text-white px-4 py-2 rounded-full shadow-lg"
      >
        🎨
      </button>

      {open && (
        <div className="mt-3 w-64 p-4 rounded-2xl shadow-xl backdrop-blur-md bg-white/10 border border-white/20">
          <h3 className="text-sm font-semibold mb-2">Background</h3>

          <div className="flex gap-2 flex-wrap mb-4">
            {bgOptions.map((bg) => (
              <div
                key={bg}
                onClick={() => setTheme(bg, foreground)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  background === bg ? "border-white" : "border-transparent"
                }`}
                style={{ background: bg }}
              />
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2">Text</h3>

          <div className="flex gap-2 flex-wrap">
            {fgOptions.map((fg) => (
              <div
                key={fg}
                onClick={() => setTheme(background, fg)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  foreground === fg ? "border-white" : "border-transparent"
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
