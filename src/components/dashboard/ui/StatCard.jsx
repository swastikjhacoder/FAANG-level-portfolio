"use client";

import clsx from "clsx";
import {
  FolderKanban,
  Code,
  Briefcase,
  Wrench,
  User,
  Activity,
  BarChart3,
} from "lucide-react";

const iconMap = {
  projects: FolderKanban,
  skills: Code,
  experience: Briefcase,
  services: Wrench,
  profile: User,
  activity: Activity,
  stats: BarChart3,
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  loading = false,
  className = "",
}) {
  const Icon = icon || iconMap[title?.toLowerCase()] || BarChart3;

  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between transition hover:shadow-md",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {title}
        </div>

        <div className="text-xl font-semibold">
          {loading ? (
            <div className="h-6 w-16 bg-gray-700 animate-pulse rounded" />
          ) : (
            value
          )}
        </div>

        {description && (
          <div className="text-xs text-gray-400">{description}</div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
        <Icon size={20} />
      </div>
    </div>
  );
}
