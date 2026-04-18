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

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
      <h2 className="text-sm font-semibold mb-4">Tech Stack Distribution</h2>

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
              <Cell key={index} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
