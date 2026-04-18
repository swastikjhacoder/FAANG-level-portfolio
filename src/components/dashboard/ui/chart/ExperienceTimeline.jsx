"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ExperienceTimeline({ data = [] }) {
  const yearMap = {};

  data.forEach((exp) => {
    const year = new Date(exp.startDate).getFullYear();
    yearMap[year] = (yearMap[year] || 0) + 1;
  });

  const formatted = Object.keys(yearMap).map((year) => ({
    year,
    value: yearMap[year],
  }));

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
      <h2 className="text-sm font-semibold mb-4">Experience Timeline</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatted}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
