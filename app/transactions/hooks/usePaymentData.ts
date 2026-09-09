import { usePaymentStore } from '../store/usePaymentStore';
import { usePaymentHistory } from './useTransactionQueries';

export function usePaymentData() {
  const { rowsPerPage, filters, setRowsPerPage, setFilters } = usePaymentStore();
  const { 
    data, 
    isLoading, 
    isFetching,
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePaymentHistory(rowsPerPage, filters);

  const payments = data?.pages ? data.pages.flatMap((page) => page.data) : [];
  const totalRows = data?.pages?.[0]?.count ? Math.max(data.pages[0].count, payments.length) : payments.length;

  return {
    payments,
    totalRows,
    isLoading,
    isFetching,
    isError: !!error,
    error,
    rowsPerPage,
    filters,
    setRowsPerPage,
    setFilters,
    refresh: refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // Keep currentPage for compatibility
    currentPage: 1,
    setCurrentPage: () => {}, // No-op
  };
}
