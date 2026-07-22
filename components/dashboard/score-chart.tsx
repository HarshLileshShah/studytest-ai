"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScoreTrendPoint } from "@/types";

export function ScoreChart({ data }: { data: ScoreTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available yet
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            axisLine={{ stroke: "#1e1e2e" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            axisLine={{ stroke: "#1e1e2e" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f0f13",
              border: "1px solid #1e1e2e",
              borderRadius: "0.5rem",
              color: "#fafafa",
              fontSize: "0.875rem",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: unknown) => [`${value}%`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{
              fill: "#7c3aed",
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: "#a78bfa",
              strokeWidth: 0,
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
