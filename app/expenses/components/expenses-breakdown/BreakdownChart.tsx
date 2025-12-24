"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SourceData } from "../../hooks/useExpensesBreakdown";

interface Props {
  data: SourceData[];
}

const COLORS = ["#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"];

export const BreakdownChart = ({ data }: Props) => {
  // Simplify data for the chart (Source Name vs Total Amount)
  const chartData = data.map((d) => ({
    name: d.sourceName,
    amount: d.total,
  }));

  return (
    <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg w-full h-[300px]">
      <h3 className="mb-4 font-semibold text-slate-400 text-sm">
        Expenses by Source
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₱${value / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: "#334155", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#334155",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#34d399" }}
            formatter={(value: number) => [
              `₱${value.toLocaleString()}`,
              "Total",
            ]}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
