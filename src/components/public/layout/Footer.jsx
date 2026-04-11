"use client";

import { FaGithub, FaLinkedin, FaArrowUp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-lg">
      {/* Top Section */}
      <div className="px-4 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-lg font-semibold gradient-text animate-gradient">
            Swastik Jha
          </div>
          <p className="text-sm text-[var(--text-muted)] text-center md:text-left max-w-sm">
            MERN Architect building scalable, secure, and high-performance web
            applications.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {["About", "Skills", "Experience", "Projects", "Contact"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition"
              >
                {item}
              </a>
            ),
          )}
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="p-2 rounded-lg border border-[var(--glass-border)] hover:bg-white/10 transition hover:scale-110"
          >
            <FaGithub size={18} />
          </a>

          <a
            href="#"
            className="p-2 rounded-lg border border-[var(--glass-border)] hover:bg-white/10 transition hover:scale-110"
          >
            <FaLinkedin size={18} />
          </a>

          <a
            href="#"
            className="p-2 rounded-lg border border-[var(--glass-border)] hover:bg-white/10 transition hover:scale-110"
          >
            <MdEmail size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 md:px-10 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
        <span>
          © {new Date().getFullYear()} Swastik Jha. All rights reserved.
        </span>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 hover:text-[var(--foreground)] transition"
        >
          Back to top <FaArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
