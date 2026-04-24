import React from "react";

const SoftSkillSection = ({ data }) => {
  if (!data) return <p className="text-center">No data found</p>;

  return (
    <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 md:space-y-6 px-4 sm:px-6">
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-gray)] leading-snug sm:leading-normal md:leading-relaxed max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-none lg:whitespace-nowrap">
        {data.subHeading}
      </p>
    </div>
  );
};

export default SoftSkillSection;
