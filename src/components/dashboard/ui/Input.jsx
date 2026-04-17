"use client";

import { useState } from "react";
import clsx from "clsx";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder = " ",
  error: externalError,
  validate,
  disabled = false,
  fullWidth = true,
  textarea = false,
  rows = 4,
  className = "",
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [internalError, setInternalError] = useState("");

  const isActive = focused || (value && value.length > 0);
  const error = externalError || internalError;

  const handleBlur = () => {
    setFocused(false);

    if (validate) {
      const err = validate(value);
      setInternalError(err || "");
    }
  };

  const baseStyles =
    "peer w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className={clsx("relative", fullWidth && "w-full")}>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          className={clsx(
            baseStyles,
            error && "border-red-500 focus:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          className={clsx(
            baseStyles,
            error && "border-red-500 focus:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          {...props}
        />
      )}

      <label
        className={clsx(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          isActive
            ? "top-1 text-xs text-blue-400"
            : "top-3 text-sm text-gray-400",
        )}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
