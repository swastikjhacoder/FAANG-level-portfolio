"use client";

import { useState } from "react";
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

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Top Bar */}
      <div className="w-full backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--glass-border)] shadow-[var(--glass-shadow)] px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl md:text-2xl font-bold gradient-text animate-gradient">
          Swastik Jha
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={`#${item.name.toLowerCase()}`}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
              >
                <Icon size={18} />
                {item.name}
              </a>
            );
          })}

          <button className="ml-4 px-4 py-2 rounded-xl gradient-bg text-white font-semibold shadow-md hover:scale-105 transition">
            Hire Me
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            className="text-[var(--text-color)]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--glass-border)] shadow-[var(--glass-shadow)] px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={`#${item.name.toLowerCase()}`}
                onClick={() => setOpen(false)} // close on click
                className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
              >
                <Icon size={18} />
                {item.name}
              </a>
            );
          })}

          <button className="mt-2 px-4 py-2 rounded-xl gradient-bg text-white font-semibold shadow-md">
            Hire Me
          </button>
        </div>
      </div>
    </nav>
  );
}
