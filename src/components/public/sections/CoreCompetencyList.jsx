"use client";

import React, { useEffect, useMemo, useState } from "react";

const CoreCompetencyList = ({ data }) => {
  const items = useMemo(() => data?.items || [], [data?.items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [completed, setCompleted] = useState([]);

  const currentText = items[currentIndex] || "";
  const displayed = currentText.slice(0, charIndex);

  useEffect(() => {
    if (!currentText) return;

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 35);

      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCompleted((prev) => [...prev, currentText]);

      setCharIndex(0);

      setCurrentIndex((prev) => {
        if (prev === items.length - 1) {
          setCompleted([]);
          return 0;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [charIndex, currentText, items.length]);

  if (!items.length) {
    return <p className="text-center">No competencies found</p>;
  }

  return (
    <div className="mt-10 w-full flex flex-col items-center text-center space-y-3">
      {completed.map((item, index) => (
        <div
          key={index}
          className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)]"
        >
          {item}
        </div>
      ))}

      <div className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)]">
        {displayed}
        <span className="animate-pulse">|</span>
      </div>
    </div>
  );
};

export default CoreCompetencyList;
