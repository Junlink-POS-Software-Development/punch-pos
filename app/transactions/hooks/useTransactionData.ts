import { useTransactionStore } from '../store/useTransactionStore';
import { useTransactionHistory } from './useTransactionQueries';

export function useTransactionData() {
  const { currentPage, rowsPerPage, filters, setCurrentPage, setRowsPerPage, setFilters } = useTransactionStore();
  const { data, isLoading, isError, error, refetch, fetchStatus } = useTransactionHistory(currentPage, rowsPerPage, filters);

  return {
    transactions: data?.data || [],
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
    fetchStatus,
  };
}
