"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      <div
        className={clsx(
          "relative w-full rounded-2xl shadow-xl border",
          "bg-[var(--bg-color)] text-[var(--text-color)] border-[var(--glass-border)]",
          "max-h-[95vh] flex flex-col",
          "animate-in fade-in zoom-in-95 duration-200",
          sizes[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--glass-border)]">
            <h2 className="text-sm sm:text-lg font-semibold truncate">
              {title}
            </h2>

            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-color)] transition text-lg"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--glass-border)] flex flex-col sm:flex-row justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
