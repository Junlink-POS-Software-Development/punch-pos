import { create } from "zustand";
import { fetchDailyCashFlow, CashFlowEntry } from "../lib/dashboard.api";
import dayjs from "dayjs";

export interface DashboardMetrics {
  cashFlow: CashFlowEntry[];
  totalNetSales: number;
  totalExpenses: number;
  isLoading: boolean;
  error: string | null;
}

interface DashboardState {
  metrics: DashboardMetrics;
  fetchMetrics: (date?: string) => Promise<void>;
}

const initialMetrics: DashboardMetrics = {
  cashFlow: [],
  totalNetSales: 0,
  totalExpenses: 0,
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: initialMetrics,
  fetchMetrics: async (date = dayjs().format("YYYY-MM-DD")) => {
    set((state) => ({
      metrics: { ...state.metrics, isLoading: true, error: null },
    }));

    try {
      const cashFlow = await fetchDailyCashFlow(date);

      // Calculate Total Net Sales: Sum of (Income + Forwarded - Expenses) for all categories?
      // Wait, the user said: "Total Net Sales - this is computed by total income of the day + the forwarded net sales from the previous day - expenses."
      // In the view:
      // cash_in = Income
      // forwarded = Forwarded Net Sales
      // cash_out = Expenses
      // balance = Net Sales (likely calculated as forwarded + cash_in - cash_out)
      
      // Let's verify the calculation logic based on the user request:
      // "Total Net Sales - this is computed by total income of the day + the forwarded net sales from the previous day - expenses."
      // This matches the 'balance' column in the view if the view logic is standard.
      // Let's sum up the 'balance' for Total Net Sales.
      
      const totalNetSales = cashFlow.reduce((sum, entry) => sum + (Number(entry.balance) || 0), 0);
      
      // "Total Expenses of the day"
      // This matches the 'cash_out' column.
      const totalExpenses = cashFlow.reduce((sum, entry) => sum + (Number(entry.cash_out) || 0), 0);

      set({
        metrics: {
          cashFlow,
          totalNetSales,
          totalExpenses,
          isLoading: false,
          error: null,
        },
      });
    } catch (error: any) {
      console.error("Dashboard Store Error:", error);
      set((state) => ({
        metrics: { ...state.metrics, isLoading: false, error: error.message },
      }));
    }
  },
}));
