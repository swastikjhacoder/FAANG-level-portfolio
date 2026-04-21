"use client";

import {
  LayoutDashboard,
  User,
  Code,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Wrench,
  Mail,
  Award,
  Speech,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  user: User,
  code: Code,
  briefcase: Briefcase,
  academic: GraduationCap,
  certification: Award,
  projects: FolderKanban,
  services: Wrench,
  testimonial: Speech,
  contact: Mail,
};

export default function PageHeader({ title, icon }) {
  const Icon = iconMap[icon];

  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && <Icon size={28} className="text-gray-700 dark:text-gray-300" />}
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  );
}
