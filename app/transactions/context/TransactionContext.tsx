"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

import { TransactionItem } from "../types"; // Adjust path to your types
import { TransactionFilters, useTransactionHistory } from "../hooks/useTransactionQueries";

interface TransactionContextType {
  // Data
  transactions: TransactionItem[];
  totalRows: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // State
  currentPage: number;
  rowsPerPage: number;
  filters: TransactionFilters;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  setFilters: (filters: TransactionFilters) => void;
  refresh: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<TransactionFilters>({ startDate: "", endDate: "" });

  const { data, isLoading, isError, error, refetch } = useTransactionHistory(
    currentPage, 
    rowsPerPage, 
    filters
  );

  const value = {
    transactions: data?.data || [],
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

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
}