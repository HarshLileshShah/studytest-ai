"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { TopicAccuracy } from "@/types";

export function TopicChart({ data }: { data: TopicAccuracy[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available yet
      </div>
    );
  }

  const getBarColor = (accuracy: number) => {
    if (accuracy >= 80) return "#10b981";
    if (accuracy >= 60) return "#f59e0b";
    return "#ef4444";
  };

  // Render dynamic Radar Chart if we have 3 or more data points
  if (data.length >= 3) {
    return (
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#2e2e3f" />
            <PolarAngleAxis
              dataKey="topic"
              tick={{ fill: "#a1a1aa", fontSize: 9 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#71717a", fontSize: 8 }}
              axisLine={false}
            />
            <Radar
              name="Accuracy"
              dataKey="accuracy"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.25}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f0f13",
                border: "1px solid #1e1e2e",
                borderRadius: "0.5rem",
                color: "#fafafa",
                fontSize: "0.875rem",
              }}
              formatter={(value: unknown) => [`${value}%`, "Accuracy"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback to simple bar chart for 1 or 2 topics to avoid visual crunching
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            axisLine={{ stroke: "#1e1e2e" }}
          />
          <YAxis
            type="category"
            dataKey="topic"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            width={120}
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
            formatter={(value: unknown) => [`${value}%`, "Accuracy"]}
          />
          <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
