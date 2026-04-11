"use client";

import { useDashboardThemeStore } from "@/store/useDashboardThemeStore";
import { Sun, Moon, Bell, User } from "lucide-react";

export default function Header() {
  const { theme, toggleTheme, hydrated } = useDashboardThemeStore();

  if (!hydrated) return null;

  return (
    <div
      className="h-16 px-6 flex items-center justify-between
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      border-b border-gray-200 dark:border-gray-700"
    >
      <div className="text-lg font-semibold">Dashboard</div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800
            text-gray-700 dark:text-gray-300
            transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="p-2 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800
            text-gray-700 dark:text-gray-300
            transition"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className="w-8 h-8 rounded-full
            bg-gray-300 dark:bg-gray-700
            flex items-center justify-center"
          >
            <User size={16} />
          </div>

          <span
            className="hidden md:block text-sm font-medium
            text-gray-800 dark:text-gray-200"
          >
            User
          </span>
        </div>
      </div>
    </div>
  );
}
