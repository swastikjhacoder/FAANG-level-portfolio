"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Code,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Wrench,
  Mail,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "About", icon: User },
  { name: "Skills", icon: Code },
  { name: "Experience", icon: Briefcase },
  { name: "Academic", icon: GraduationCap },
  { name: "Projects", icon: FolderKanban },
  { name: "Services", icon: Wrench },
  { name: "Contact", icon: Mail },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (id) => {
    if (pathname !== "/") {
      router.push(`/#${id}`);
      setOpen(false);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }

    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-1000">
      <div className="w-full backdrop-blur-xl bg-(--glass-bg) border-b border-(--glass-border) shadow-(--glass-shadow) px-6 py-3 flex items-center justify-between">
        <div
          onClick={() => handleNavigate("home")}
          className="text-xl md:text-2xl font-bold gradient-text animate-gradient cursor-pointer"
        >
          Swastik Jha
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.name.toLowerCase())}
                className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-color) transition"
              >
                {Icon && <Icon size={18} />}
                {item.name}
              </button>
            );
          })}

          <button className="ml-4 px-4 py-2 rounded-xl gradient-bg text-white font-semibold shadow-md hover:scale-105 transition">
            Hire Me
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="backdrop-blur-xl bg-(--glass-bg) border-b border-(--glass-border) px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.name.toLowerCase())}
                className="flex items-center gap-3 text-(--text-muted) hover:text-(--text-color)"
              >
                {Icon && <Icon size={18} />}
                {item.name}
              </button>
            );
          })}

          <button className="mt-2 px-4 py-2 rounded-xl gradient-bg text-white font-semibold">
            Hire Me
          </button>
        </div>
      </div>
    </nav>
  );
}
