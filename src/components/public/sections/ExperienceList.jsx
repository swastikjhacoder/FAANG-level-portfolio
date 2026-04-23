"use client";

import React, { useState } from "react";
import FadeInSection from "@/components/public/ui/FadeInSection";

const formatDate = (date) => {
  if (!date) return "Present";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const getDuration = (start, end) => {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();

  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return `${years ? `${years} yr ` : ""}${
    remainingMonths ? `${remainingMonths} mo` : ""
  }`.trim();
};

const cleanArray = (arr = []) =>
  arr.filter((item) => item && item.trim() !== "");

const parseProject = (text) => {
  const [title, ...rest] = text.split(":");
  return {
    title: title?.trim(),
    description: rest.join(":").trim(),
  };
};

const ExperienceList = ({ data = [] }) => {
  const [expanded, setExpanded] = useState({});

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="text-center text-[var(--text-muted)] text-sm">
        No experience data available.
      </p>
    );
  }

  const experiences = [...data].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  );

  return (
    <div className="relative w-full mt-10 md:mt-16">
      <div className="hidden md:block absolute left-1/2 top-0 h-full w-[2px] bg-[var(--glass-border)] -translate-x-1/2" />

      <div className="space-y-12 md:space-y-16">
        {experiences.map((exp, index) => {
          const isLeft = index % 2 === 0;
          const isExpanded = expanded[exp._id];

          const history = cleanArray(exp.history);
          const achievements = cleanArray(exp.achievements);

          const projects =
            exp.projects?.length && exp.projects !== exp.achievements
              ? cleanArray(exp.projects)
              : [];

          return (
            <FadeInSection key={exp._id} delay={index * 0.1}>
              <div
                className={`relative flex w-full justify-start ${
                  isLeft ? "md:justify-start" : "md:justify-end"
                }`}
              >
                <span className="hidden md:block absolute left-1/2 top-4 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-[var(--bg-color)] -translate-x-1/2 z-10" />

                <div
                  className={`hidden md:block absolute top-5 w-10 h-[2px] bg-[var(--glass-border)] ${
                    isLeft ? "left-1/2 -translate-x-full" : "left-1/2"
                  }`}
                />

                <div className="w-full md:w-1/2 px-2 sm:px-4">
                  <div className="p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur shadow-[var(--glass-shadow)] transition-all duration-300 min-h-[260px] flex flex-col">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                        {exp.role}
                        <span className="text-[var(--text-muted)] font-normal">
                          {" "}
                          @ {exp.company}
                        </span>
                      </h3>

                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {getDuration(exp.startDate, exp.endDate)}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </p>

                    {history.length > 0 && (
                      <Section title="Responsibilities" isExpanded={isExpanded}>
                        {history.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </Section>
                    )}

                    {projects.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Projects
                        </h4>
                        <ul
                          className={`space-y-2 text-sm text-[var(--text-secondary)] ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {projects.map((item, i) => {
                            const { title, description } = parseProject(item);
                            return (
                              <li key={i}>
                                <strong className="text-[var(--text-primary)]">
                                  {title}
                                </strong>
                                {description && (
                                  <span className="block text-[var(--text-secondary)]">
                                    {description}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {achievements.length > 0 && (
                      <Section title="Achievements" isExpanded={isExpanded}>
                        {achievements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </Section>
                    )}

                    <div className="flex-grow" />

                    {(history.length > 2 ||
                      projects.length > 2 ||
                      achievements.length > 2) && (
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [exp._id]: !prev[exp._id],
                          }))
                        }
                        className="text-xs text-[var(--accent)] mt-3 hover:opacity-[var(--hover-opacity)] transition self-start"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>
          );
        })}
      </div>
    </div>
  );
};

const Section = ({ title, children, isExpanded }) => (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">
      {title}
    </h4>

    <ul
      className={`list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1 ${
        isExpanded ? "" : "line-clamp-3"
      }`}
    >
      {children}
    </ul>
  </div>
);

export default ExperienceList;
