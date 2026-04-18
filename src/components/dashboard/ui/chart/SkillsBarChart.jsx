"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SkillsBarChart({ data = [] }) {
  const formatted = data.map((s) => ({
    name: s.name,
    value: s.proficiency,
  }));

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
      <h2 className="text-sm font-semibold mb-4">Skills Proficiency</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
