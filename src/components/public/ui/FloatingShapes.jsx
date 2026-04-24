"use client";

import React from "react";

const shapes = [
  {
    size: 180,
    top: "10%",
    left: "5%",
    delay: "0s",
    gradient: "var(--gradient-primary)",
  },
  {
    size: 220,
    top: "40%",
    left: "80%",
    delay: "2s",
    gradient: "linear-gradient(135deg, var(--accent), transparent)",
  },
  {
    size: 140,
    top: "70%",
    left: "20%",
    delay: "4s",
    gradient: "linear-gradient(135deg, var(--accent-2), transparent)",
  },
  {
    size: 200,
    top: "20%",
    left: "60%",
    delay: "1s",
    gradient: "linear-gradient(135deg, var(--chart-tertiary), transparent)",
  },
  {
    size: 260,
    top: "80%",
    left: "75%",
    delay: "3s",
    gradient: "var(--gradient-logo)",
  },
];

const FloatingShapes = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden animate-[drift_40s_linear_infinite]">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-30 ${
            i % 2 === 0 ? "blur-2xl" : "blur-xl"
          }`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            top: shape.top,
            left: shape.left,
            background: shape.gradient,

            animation: `
            float ${10 + i * 3}s ease-in-out infinite ${shape.delay},
            floatOpacity ${6 + i * 2}s ease-in-out infinite ${shape.delay}
          `,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
