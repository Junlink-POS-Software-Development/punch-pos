import { useQuery } from "@tanstack/react-query";
import { fetchQuantitySoldByCategory } from "../lib/dashboard.api";
import dayjs from "dayjs";

export interface QuantitySoldMetric {
  category: string;
  quantity: number;
}

export function useQuantitySoldMetrics(
  date: string = dayjs().format("YYYY-MM-DD")
) {
  const {
    data: metrics = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-quantity-sold", date],
    queryFn: () => fetchQuantitySoldByCategory(date),
    staleTime: 0,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return { data: metrics, isLoading, error };
}
