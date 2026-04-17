"use client";

import { createPortal } from "react-dom";
import Loader from "./Loader";

export default function GlobalLoader({ open, text = "Loading..." }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow flex flex-col items-center gap-3">
        <Loader size="md" />
        <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
      </div>
    </div>,
    document.body,
  );
}
