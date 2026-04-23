import React from 'react'

const ExperienceSection = ({ data }) => {
  if (!data) return <p className="text-center">No data found</p>;

  return (
    <div className="space-y-6 text-center flex flex-col items-center">
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-secondary)] max-w-2xl mx-auto">
        {data.subHeading}
      </p>

      <h3 className="text-4xl sm:text-5xl lg:text-6xl font-semibold gradient-text">
        {data.heading}
      </h3>

      <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-3xl mx-auto">
        {data.description}
      </p>
    </div>
  );
};

export default ExperienceSection