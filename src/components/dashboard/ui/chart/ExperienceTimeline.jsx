"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
    <div className="rounded-xl p-4 bg-(--glass-bg) border border-(--glass-border) shadow-(--glass-shadow)">
      <h2 className="text-sm font-semibold mb-4 text-(--text-color)">
        Experience Timeline
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatted}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />

          <XAxis
            dataKey="year"
            stroke="var(--text-muted)"
            tick={{ fill: "var(--text-muted)" }}
          />

          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: "var(--text-muted)" }}
          />

          <Tooltip
            contentStyle={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-color)",
            }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-primary)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
