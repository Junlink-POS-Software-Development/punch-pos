// ─── Mock Data Constants for POS Dashboard ────────────────────────────────────
// These will eventually be replaced by real API calls / Supabase queries.

export interface DashboardStats {
  grossSales: number;
  salesDiscount: number;
  salesReturn: number;
  salesAllowance: number;
  netSales: number;
  cashInDrawer: number;
  cashout: {
    total: number;
    cogs: number;
    opex: number;
    remittance: number;
  };
  netProfit: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  qty: number;
  threshold: number;
}

export interface ExpiringItem {
  id: number;
  name: string;
  expires: string;
}

export interface InventoryStatsData {
  lowStock: LowStockItem[];
  mostStocked: { name: string; qty: number };
  expiringSoon: ExpiringItem[];
}

export interface ActivityItem {
  id: number;
  type: "SALE" | "OPEX" | "REMIT" | "COGS";
  amount: number;
  time: string;
  desc: string;
}

// ─── Initial Values ────────────────────────────────────────────────────────────

export const INITIAL_STATS: DashboardStats = {
  // Sales Breakdown
  grossSales: 16200.0,
  salesDiscount: 500.0,
  salesReturn: 150.0,
  salesAllowance: 100.0,
  netSales: 15450.0, // 16200 - 500 - 150 - 100

  // Cash & Cashout Breakdown
  cashInDrawer: 12500.0,
  cashout: {
    total: 3450.0,
    cogs: 1200.0, // Cost of Goods Sold / Supplier payments
    opex: 250.0, // Operating Expenses (Ice, etc.)
    remittance: 2000.0, // Sent to safe/bank/manager
  },

  // Profit
  netProfit: 14000.0, // netSales - cogs - opex
};

export const INITIAL_INVENTORY_STATS: InventoryStatsData = {
  lowStock: [
    { id: 1, name: "Espresso Beans (1kg)", qty: 2, threshold: 5 },
    { id: 2, name: "Whole Milk (1L)", qty: 4, threshold: 10 },
  ],
  mostStocked: { name: "Paper Cups (12oz)", qty: 850 },
  expiringSoon: [
    { id: 1, name: "Fresh Milk", expires: "Tomorrow" },
    { id: 2, name: "Chocolate Syrup", expires: "In 3 Days" },
  ],
};

export const INITIAL_RECENT_ACTIVITY: ActivityItem[] = [
  { id: 1, type: "SALE", amount: 150.0, time: "10:45 AM", desc: "Order #1042" },
  { id: 2, type: "OPEX", amount: -50.0, time: "10:42 AM", desc: "Ice Delivery" },
  { id: 3, type: "SALE", amount: 500.0, time: "10:30 AM", desc: "Order #1041" },
  {
    id: 4,
    type: "REMIT",
    amount: -2000.0,
    time: "09:15 AM",
    desc: "Morning Remittance",
  },
  {
    id: 5,
    type: "COGS",
    amount: -1200.0,
    time: "08:30 AM",
    desc: "Coffee Bean Supplier COD",
  },
];

export const CASH_LIMIT = 10000.0;
