"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export default function AutoCloseModal({
  open,
  message,
  type = "success",
  duration = 2000,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const variants = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  const icons = {
    success: "✔",
    error: "✕",
    info: "ℹ",
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={clsx(
          "px-6 py-4 rounded-xl shadow-xl text-white flex items-center gap-3 animate-fadeIn",
          variants[type],
        )}
      >
        <span className="text-lg">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
