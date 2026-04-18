"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p className="text-center sm:text-left leading-relaxed">
            © {new Date().getFullYear()} Swastik Jha. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-1">
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition whitespace-nowrap"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition whitespace-nowrap"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition whitespace-nowrap"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
