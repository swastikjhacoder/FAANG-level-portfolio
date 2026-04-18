"use client";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Swastik Jha
          </p>

          <div className="flex justify-center sm:justify-end gap-4">
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
