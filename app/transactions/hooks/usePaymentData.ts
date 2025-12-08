import { usePaymentStore } from '../store/usePaymentStore';
import { usePaymentHistory } from './useTransactionQueries';

export function usePaymentData() {
  const { currentPage, rowsPerPage, filters, setCurrentPage, setRowsPerPage, setFilters } = usePaymentStore();
  const { data, isLoading, isError, error, refetch } = usePaymentHistory(currentPage, rowsPerPage, filters);

  return {
    payments: data?.data || [],
    totalRows: data?.count || 0,
    isLoading,
    isError,
    error,
    currentPage,
    rowsPerPage,
    filters,
    setCurrentPage,
    setRowsPerPage,
    setFilters,
    refresh: refetch,
  };
}
