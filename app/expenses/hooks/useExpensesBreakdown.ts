import { useState, useEffect } from "react";
import { fetchExpensesBreakdown } from "../lib/expenses.api";

export type BreakdownRow = {
  classification: string;
  amount: number;
};

export type SourceData = {
  sourceName: string;
  total: number;
  breakdown: BreakdownRow[];
};

export const useExpensesBreakdown = (startDate: string, endDate: string) => {
  const [data, setData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchExpensesBreakdown(startDate, endDate);

        // Transform aggregated object into an array for the UI
        const formattedData: SourceData[] = Object.entries(result).map(
          ([sourceName, classifications]) => {
            const breakdown = Object.entries(classifications)
              .map(([cls, amt]) => ({
                classification: cls,
                amount: amt,
              }))
              .sort((a, b) => b.amount - a.amount); // Sort by highest expense

            const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

            return {
              sourceName,
              total,
              breakdown,
            };
          }
        );

        setData(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  return { data, loading };
};
