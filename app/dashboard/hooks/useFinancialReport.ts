"use client";

import { useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import { fetchFinancialReport } from "../lib/dashboard.api";
import { FinancialReportItem } from "../lib/types";

export const useFinancialReport = (
  defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD'),
  defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD')
) => {
  const [dateRange, setDateRange] = useState({
    start: defaultStartDate,
    end: defaultEndDate
  });

  // 1. Define the SWR Key
  // The key acts as the dependency array. When these values change, SWR re-fetches.
  const swrKey = ['financial-report', dateRange.start, dateRange.end];

  // 2. Define the Fetcher
  // SWR passes the expanded key array as arguments to the fetcher
  const fetcher = async ([, start, end]: [string, string, string]) => {
    return await fetchFinancialReport(start, end);
  };

  // 3. Initialize SWR
  const { data, error, isLoading, isValidating, mutate } = useSWR<FinancialReportItem[]>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false, // Disable auto-fetch on window focus (optional)
      keepPreviousData: false,  // Set to true if you want to show old data while loading new dates
    }
  );

  const updateDate = (key: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  return {
    data: data || [], // Always return an array to prevent crashes
    isLoading,        // True if no data and currently fetching
    isValidating,     // True if currently fetching (even if data exists)
    isError: error,
    dateRange,
    updateDate,
    refetch: mutate   // Expose SWR's mutate function for manual reloads
  };
};