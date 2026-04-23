"use client";

import React from "react";

const formatDate = (date) => {
  if (!date) return "Present";

  const d = new Date(date);
  if (isNaN(d)) return "";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const cleanArray = (arr = []) => {
  return arr.filter((item) => item && item.trim() !== "");
};

const ExperienceList = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No experience data available.</p>
    );
  }

  const experiences = [...data].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  );

  return (
    <div className="relative w-full">
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 h-full w-[2px] bg-[var(--glass-border)] -translate-x-1/2" />

      <div className="space-y-16">
        {experiences.map((exp, index) => {
          const isLeft = index % 2 === 0;

          const history = cleanArray(exp.history);
          const achievements = cleanArray(exp.achievements);
          const projects = cleanArray(exp.projects);

          return (
            <div
              key={exp._id}
              className={`relative flex w-full ${
                isLeft ? "justify-start" : "justify-end"
              }`}
            >
              {/* Timeline Dot */}
              <span className="absolute left-1/2 top-4 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white dark:border-black -translate-x-1/2 z-10" />

              {/* Card */}
              <div className="w-1/2 px-4">
                <div className="p-5 rounded-2xl border border-[var(--glass-border)] bg-white/5 backdrop-blur">
                  <h3 className="text-lg font-semibold">
                    {exp.role}{" "}
                    <span className="text-gray-500 font-normal">
                      @ {exp.company}
                    </span>
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.endDate ? formatDate(exp.endDate) : "Present"}
                  </p>

                  {history.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Responsibilities
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        {history.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Achievements
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        {achievements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Projects
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        {projects.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExperienceList;
