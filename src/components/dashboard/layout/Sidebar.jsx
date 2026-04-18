"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { dashboardRoutes } from "@/config/dashboardRoutes";

import {
  LayoutDashboard,
  User,
  Code,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Wrench,
  Mail,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  user: User,
  code: Code,
  briefcase: Briefcase,
  academic: GraduationCap,
  projects: FolderKanban,
  services: Wrench,
  contact: Mail,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return null;

  const fullName = user?.name?.displayName || "User";
  const email = user?.email || "";
  const role = user?.roles?.[0]?.replace("_", " ") || "USER";
  const image = user?.userImageUrl || "/default-avatar.png";

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <Image
          src={image}
          alt="User"
          width={80}
          height={80}
          className="rounded-full object-cover border"
        />
        <h2 className="mt-3 text-sm font-semibold">{fullName}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
        <span className="mt-1 text-xs px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">
          {role}
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {dashboardRoutes.map((item, index) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const Icon = iconMap[item.icon];

          return (
            <div key={item.name}>
              {index === 1 && (
                <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              )}

              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {Icon && <Icon size={18} />}
                <span>{item.name}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
