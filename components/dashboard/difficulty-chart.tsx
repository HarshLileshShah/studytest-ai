"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { DifficultyBreakdown } from "@/types";

const COLORS: Record<string, string> = {
  EASY: "#10b981",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
};

export function DifficultyChart({ data }: { data: DifficultyBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
    value: d.total,
    accuracy: d.accuracy,
    correct: d.correct,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[data[index].difficulty] || "#7c3aed"}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f0f13",
              border: "1px solid #1e1e2e",
              borderRadius: "0.5rem",
              color: "#fafafa",
              fontSize: "0.875rem",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", color: "#a1a1aa" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
