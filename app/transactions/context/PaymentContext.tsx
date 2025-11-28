"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { usePaymentHistory, TransactionFilters } from "../hooks/useTransactionQueries";
import { PaymentRecord } from "../types";

interface PaymentContextType {
  payments: PaymentRecord[];
  totalRows: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  currentPage: number;
  rowsPerPage: number;
  filters: TransactionFilters;
  
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  setFilters: (filters: TransactionFilters) => void;
  refresh: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<TransactionFilters>({ startDate: "", endDate: "" });

  const { data, isLoading, isError, error, refetch } = usePaymentHistory(
    currentPage, 
    rowsPerPage, 
    filters
  );

  const value = {
    payments: data?.data || [],
    totalRows: data?.count || 0,
    isLoading,
    isError,
    error: error as Error | null,
    currentPage,
    rowsPerPage,
    filters,
    setCurrentPage,
    setRowsPerPage,
    setFilters,
    refresh: refetch,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
}