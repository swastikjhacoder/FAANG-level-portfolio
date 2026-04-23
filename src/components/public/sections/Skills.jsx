"use client";

import Image from "next/image";

const Skills = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <section className="w-full">
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {data.map((skill) => {
          const percentage = Math.min(
            Math.max((skill.proficiency / 10) * 100, 0),
            100,
          );

          return (
            <div
              key={skill._id}
              className="
                group
                p-4 sm:p-5
                rounded-2xl
                border border-[var(--glass-border)]
                bg-[var(--glass-bg)]
                backdrop-blur-md
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg
              "
            >
              {/* Top Section */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image
                    src={skill.icon?.url || "/placeholder.png"}
                    alt={skill.name}
                    fill
                    sizes="(max-width: 640px) 32px, 40px"
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">
                    {skill.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {skill.experience} yrs experience
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="
                      h-full
                      bg-gradient-to-r from-blue-500 to-purple-500
                      transition-all duration-700 ease-out
                    "
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Proficiency</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {skill.proficiency}/10
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Skills;
