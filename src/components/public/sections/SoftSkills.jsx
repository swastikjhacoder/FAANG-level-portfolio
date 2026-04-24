import React from "react";

const SoftSkills = ({ data }) => {
  if (!data?.items?.length) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-6xl mx-auto">
      {data.items.map((skill, index) => (
        <div
          key={index}
          className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 rounded-xl backdrop-blur-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] text-[var(--text-gray)] text-sm sm:text-base text-center capitalize transition-all duration-300 ease-out hover:scale-105 hover:bg-[var(--surface-hover)] hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)]"
        >
          {skill}
        </div>
      ))}
    </div>
  );
};

export default SoftSkills;
