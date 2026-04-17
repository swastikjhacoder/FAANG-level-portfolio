"use client";

export default function Loader({ size = "md", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : ""
      }`}
    >
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-300
          border-t-black
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
}
