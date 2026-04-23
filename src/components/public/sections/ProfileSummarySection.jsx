import React from "react";
import RibbonCard from "../ui/RibbonCard";

const ProfileSummarySection = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.map((item) => (
          <RibbonCard key={item._id}>
            <div className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]"></div>

            <p className="leading-relaxed">{item.items?.[0]}</p>
          </RibbonCard>
        ))}
      </div>
    </div>
  );
};

export default ProfileSummarySection;
