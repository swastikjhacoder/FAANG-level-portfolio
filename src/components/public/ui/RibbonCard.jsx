import React from "react";

const RibbonCard = ({ children }) => {
  return (
    <div className="relative h-full pt-8 pr-6 pb-5 pl-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[var(--accent)] overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
        <div className="absolute top-[18px] right-[-50px] w-[180px] h-[22px] rotate-45 bg-[image:var(--gradient-primary)] animate-gradient shadow-md overflow-hidden rounded-sm">
          <div className="absolute inset-0 shine-overlay" />
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default RibbonCard;
