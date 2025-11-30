"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { useSettings } from "@/context/SettingsContext";

interface ProfitData {
  date: string;
  revenue: number;
  profit: number;
}

interface CategoryData {
  name: string;
  value: number;
  [key: string]: any;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function ProfitTrendChart({ data }: { data: ProfitData[] }) {
  const { currency } = useSettings();

  return (
    // FIX 1: Add 'min-w-0' to ensure Grid containers don't collapse width to 0
    <div className="w-full h-64 min-h-[250px] min-w-1">
      {/* FIX 2: Add minWidth={0} prop to satisfy Recharts */}
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{ fill: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: "#94a3b8" }}
            tickLine={{ stroke: "#94a3b8" }}
            tickFormatter={(value) => formatCurrency(value, currency)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
            itemStyle={{ color: "#f8fafc" }}
            formatter={(value: number) => [formatCurrency(value, currency), ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#3b82f6"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            name="Net Profit" 
            stroke="#10b981" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonutChart({ data }: { data: CategoryData[] }) {
  const { currency } = useSettings();

  return (
    // FIX 1: Add 'min-w-0'
    <div className="w-full h-64 min-h-[250px] min-w-0">
      {/* FIX 2: Add minWidth={0} */}
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
             itemStyle={{ color: "#f8fafc" }}
             formatter={(value: number) => [formatCurrency(value, currency), "Sales"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}