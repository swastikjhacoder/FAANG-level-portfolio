"use client";

import React from "react";
import RibbonCard from "@/components/public/ui/RibbonCard";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).getFullYear();
};

const AcademicList = ({ data = [] }) => {
  if (!data.length) return null;

  const sortedData = [...data].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedData.map((item) => (
        <RibbonCard key={item._id}>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
              {item.degree} • {item.fieldOfStudy}
            </h3>

            <p className="text-sm text-[var(--text-secondary)]">
              {item.institution}
            </p>

            <p className="text-xs text-[var(--text-secondary)]">
              {item.boardOrUniversity}
            </p>

            <p className="text-xs text-[var(--text-secondary)]">
              {formatDate(item.startDate)} -{" "}
              {item.endDate ? formatDate(item.endDate) : "Present"}
            </p>

            {item.specializations?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {item.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {item.description && (
              <p className="text-sm text-[var(--text-secondary)] pt-1">
                {item.description}
              </p>
            )}
          </div>
        </RibbonCard>
      ))}
    </div>
  );
};

export default AcademicList;
