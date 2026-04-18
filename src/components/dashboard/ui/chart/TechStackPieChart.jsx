"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TechStackPieChart({ projects = [] }) {
  const techCount = {};

  projects.forEach((p) => {
    p.techStack?.forEach((t) => {
      techCount[t.name] = (techCount[t.name] || 0) + 1;
    });
  });

  const data = Object.keys(techCount).map((key) => ({
    name: key,
    value: techCount[key],
  }));

  const COLORS = [
    "var(--chart-primary)",
    "var(--chart-secondary)",
    "var(--chart-tertiary)",
    "#22c55e",
    "#3b82f6",
  ];

  return (
    <div className="rounded-xl p-4 bg-(--glass-bg) border border-(--glass-border) shadow-(--glass-shadow)">
      <h2 className="text-sm font-semibold mb-4 text-(--text-color)">
        Tech Stack Distribution
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-color)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
