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
import { BreakdownRow } from "../../hooks/useExpensesBreakdown";

interface Props {
  data: BreakdownRow[];
  sourceName: string;
}

const COLORS = [
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#f87171",
  "#818cf8",
];

export const BreakdownChart = ({ data, sourceName }: Props) => {
  // Map data to the shape Recharts expects
  const chartData = data.map((d) => ({
    name: d.classification,
    amount: d.amount,
  }));

  return (
    <div className="slide-in-from-bottom-4 bg-slate-900/50 p-4 border border-slate-700 rounded-lg w-full h-[350px] animate-in duration-500 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-400 text-sm">
          Spending Breakdown:{" "}
          <span className="text-emerald-400">{sourceName}</span>
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
        >
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
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
            formatter={(value: number) => [
              `₱${value.toLocaleString()}`,
              "Amount",
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
