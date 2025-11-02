import Link from "next/link"; // Import Link
import {
  ArrowLeft, // Import ArrowLeft icon
  ArrowUpRight,
  DollarSign,
  Users,
  ShoppingBag,
} from "lucide-react";

// Mock data visualization components
// We can create these simple SVG placeholders directly in the component

/**
 * A mock SVG line chart
 */
const MockLineChart = () => (
  <div className="opacity-75 w-full h-64">
    <svg
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      {/* --- Grid Lines --- */}
      <line
        x1="0"
        y1="20"
        x2="200"
        y2="20"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="40"
        x2="200"
        y2="40"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="60"
        x2="200"
        y2="60"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="80"
        x2="200"
        y2="80"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />

      {/* --- Data Line --- */}
      {/* This path uses your --color-accent from globals.css */}
      <path
        d="M 0 80 Q 20 40, 40 50 T 80 60 T 120 40 T 160 50 T 200 20"
        fill="none"
        stroke="var(--color-accent, #64ffda)"
        strokeWidth="2"
      />
    </svg>
  </div>
);

/**
 * A mock SVG Donut Chart
 */
const MockDonutChart = () => (
  <div className="mx-auto w-48 h-48">
    <svg viewBox="0 0 32 32" className="w-full h-full">
      {/* Background circle */}
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="4"
      ></circle>
      {/* Segment 1 (Blue) */}
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="#3b82f6" // blue-500
        strokeWidth="4"
        strokeDasharray="60 100" // 60% of circumference
        strokeDashoffset="25" // Rotates start position
      ></circle>
      {/* Segment 2 (Accent) */}
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="var(--color-accent, #64ffda)"
        strokeWidth="4"
        strokeDasharray="25 100" // 25% of circumference
        strokeDashoffset="-35" // Starts after the blue segment
      ></circle>
    </svg>
  </div>
);

// The main Dashboard Page component
export default function AnalyticsDashboardPage() {
  return (
    <div className="p-6 text-white">
      {/* --- ADDED BACK BUTTON --- */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="mb-4 font-bold text-2xl">Analytics Dashboard</h1>
      {/* HEADER BORDER */}
      <div className="mb-8 border border-slate-700"></div>

      {/* --- 1. STATS CARDS --- */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Card 1: Total Revenue */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">$45,231.89</p>
          <p className="mt-1 text-slate-400 text-xs">+20.1% from last month</p>
        </div>

        {/* Card 2: New Customers */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">New Customers</p>
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">+2,350</p>
          <p className="mt-1 text-slate-400 text-xs">+180.1% from last month</p>
        </div>

        {/* Card 3: Total Sales */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Sales</p>
            <ShoppingBag className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">+12,234</p>
          <p className="mt-1 text-slate-400 text-xs">+19% from last month</p>
        </div>

        {/* Card 4: Bounce Rate */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Bounce Rate</p>
            <ArrowUpRight className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">24.5%</p>
          <p className="mt-1 text-slate-400 text-xs">-5.2% from last month</p>
        </div>
      </div>

      {/* --- 2. CHARTS --- */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 p-6 glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Revenue Over Time</h3>
          <MockLineChart />
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-1 p-6 glass-effect">
          <h3 className="mb-4 font-semibold text-lg text-center">
            Traffic Sources
          </h3>
          <MockDonutChart />
          <div className="space-y-2 mt-4 text-slate-300 text-sm">
            <div className="flex justify-between items-center">
              <span>Direct</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Referral</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Social</span>
              <span className="font-medium">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. DATA TABLE --- */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-lg">Recent Transactions</h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-slate-700 border-b text-slate-400">
              <th className="py-2">Invoice ID</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="py-3">INV-1234</td>
              <td className="py-3">John Doe</td>
              <td className="py-3">
                <span className="bg-green-500/20 px-2 py-0.5 rounded-full text-green-300 text-xs">
                  Paid
                </span>
              </td>
              <td className="py-3 text-right">$250.00</td>
            </tr>
            <tr>
              <td className="py-3">INV-1235</td>
              <td className="py-3">Jane Smith</td>
              <td className="py-3">
                <span className="bg-yellow-500/20 px-2 py-0.5 rounded-full text-yellow-300 text-xs">
                  Pending
                </span>
              </td>
              <td className="py-3 text-right">$150.00</td>
            </tr>
            <tr>
              <td className="py-3">INV-1236</td>
              <td className="py-3">Sam Wilson</td>
              <td className="py-3">
                <span className="bg-green-500/20 px-2 py-0.5 rounded-full text-green-300 text-xs">
                  Paid
                </span>
              </td>
              <td className="py-3 text-right">$350.00</td>
            </tr>
            <tr>
              <td className="py-3">INV-1237</td>
              <td className="py-3">Mike Johnson</td>
              <td className="py-3">
                <span className="bg-red-500/20 px-2 py-0.5 rounded-full text-red-300 text-xs">
                  Failed
                </span>
              </td>
              <td className="py-3 text-right">$50.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
