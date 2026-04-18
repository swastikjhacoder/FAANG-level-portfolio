"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SkillsBarChart({ data = [] }) {
  const formatted = data.map((s) => ({
    name: s.name,
    value: s.proficiency,
  }));

  return (
    <div className="rounded-xl p-4 bg-(--glass-bg) border border-(--glass-border) shadow-(--glass-shadow)">
      <h2 className="text-sm font-semibold mb-4 text-(--text-color)">
        Skills Proficiency
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
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

          <Bar
            dataKey="value"
            fill="var(--chart-secondary)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
