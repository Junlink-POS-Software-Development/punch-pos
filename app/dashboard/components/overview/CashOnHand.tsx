import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import { DragHandleProps } from "./DashboardGrid";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFlowCategories } from "@/app/expenses/lib/cashflow.api";
import { useMemo } from "react";

interface Props {
  dragHandleProps?: DragHandleProps;
}

const CashOnHand = ({ dragHandleProps }: Props) => {
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["flow-categories"],
    queryFn: fetchFlowCategories,
  });

  const isLoading = isMetricsLoading || isCategoriesLoading;
  const error = metricsError;

  const displayCashFlow = useMemo(() => {
    if (!metrics) return [];
    
    // Filter out 'Overall' from categories as we show Total separately
    const filteredCategories = categories.filter(cat => cat !== "Overall");
    
    // If no categories fetched yet, just use what's in metrics
    if (filteredCategories.length === 0) return metrics.cashFlow;

    // Merge categories with metrics data
    return filteredCategories.map(category => {
      const existingEntry = metrics.cashFlow.find(cf => cf.category === category);
      if (existingEntry) return existingEntry;
      
      // Return a zeroed entry if category is missing
      return {
        category,
        balance: 0,
        cash_in: 0,
        cash_out: 0,
        forwarded: 0,
        date: "",
        store_id: ""
      };
    });
  }, [metrics, categories]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full min-h-[200px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex justify-center items-center bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full min-h-[200px] text-red-400">
        Error loading data
      </div>
    );
  }

  const { totalNetBalance } = metrics;

  return (
    <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full overflow-hidden text-white">
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-slate-700/30 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Cash On Hand</h2>
      </div>
      
      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Total Net Balance</p>
          <p className="font-bold text-emerald-400 text-3xl">
            ₱
            {totalNetBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-3">
          {displayCashFlow.map((entry) => (
            <div
              key={entry.category}
              className="flex justify-between items-center pb-2 border-slate-700 last:border-0 border-b"
            >
              <span className="text-slate-300">{entry.category}</span>
              <span className="font-medium">
                ₱
                {entry.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashOnHand;
