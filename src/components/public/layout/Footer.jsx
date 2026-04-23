"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin, FaArrowUp, FaFacebook } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const navItems = [
  "About",
  "Skills",
  "Experience",
  "Academic",
  "Projects",
  "Services",
  "Testimonial",
  "Contact",
];

const socialLinks = [
  {
    Icon: FaGithub,
    href: "https://github.com/swastikjhacoder",
  },
  {
    Icon: FaLinkedin,
    href: "https://www.linkedin.com/in/swastik-jha-467583181/",
  },
  {
    Icon: SiLeetcode,
    href: "https://leetcode.com/u/swastikjhacoder/",
  },
  {
    Icon: FaFacebook,
    href: "https://www.facebook.com/swastik.jha.2025",
  },
];

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-(--glass-border) bg-(--glass-bg) backdrop-blur-lg">
      <div className="px-4 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            href="/#home"
            scroll={false}
            className="text-lg font-semibold gradient-text animate-gradient"
          >
            Swastik Jha
          </Link>
          <p className="text-sm text-(--text-muted) text-center md:text-left max-w-sm">
            MERN Architect building scalable, secure, and high-performance web
            applications.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {navItems.map((item) => (
            <a
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="text-(--text-muted) hover:text-(--text-color) transition"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map(({ Icon, href }, i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-(--glass-border) hover:bg-(--surface) transition hover:scale-110"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-10 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-(--text-muted)">
        <span>
          © {new Date().getFullYear()} Swastik Jha. All rights reserved.
        </span>

        <div className="flex items-center gap-4">
          <a
            href="/sitemap.xml"
            target="_blank"
            className="hover:text-(--text-color) transition"
          >
            Sitemap
          </a>

          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-(--text-color) transition"
          >
            Privacy Policy
          </Link>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 hover:text-(--text-color) transition"
        >
          Back to top <FaArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
