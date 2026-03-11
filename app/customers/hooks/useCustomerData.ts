"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { fetchCustomerFeatureData, fetchTopSpenders } from "../lib/customer.api";
import { useCustomerStore } from "../store/useCustomerStore";
import { CustomerGroup, Customer, GuestTransaction } from "../lib/types";

const QUERY_KEY_PREFIX = "customer-feature-data";

const EMPTY_GROUPS: CustomerGroup[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_TRANSACTIONS: GuestTransaction[] = [];

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split("T")[0];

// Get today's date as default
const getTodayDate = () => formatDate(new Date());

interface UseCustomerDataProps {
  initialData?: {
    groups: CustomerGroup[];
    customers: Customer[];
    guestTransactions: GuestTransaction[];
  };
}

export function useCustomerData({ initialData }: UseCustomerDataProps = {}) {
  const queryClient = useQueryClient();
  
  // ─── State ──────────────────────────────────────────────────────────────────
  // ─── State ──────────────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  
  // Use specific selectors to prevent unnecessary re-renders
  const searchTerm = useCustomerStore((s) => s.searchTerm);
  const selectedGroupId = useCustomerStore((s) => s.selectedGroupId);
  const selectedCustomerId = useCustomerStore((s) => s.selectedCustomerId);
  const showTopSpendersOnly = useCustomerStore((s) => s.showTopSpendersOnly);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const queryKey = [QUERY_KEY_PREFIX, startDate, endDate, showTopSpendersOnly];

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      if (showTopSpendersOnly) return fetchTopSpenders();
      return fetchCustomerFeatureData(startDate, endDate);
    },
    initialData: !showTopSpendersOnly && startDate === getTodayDate() && endDate === getTodayDate() ? initialData : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Filtered Data ──────────────────────────────────────────────────────────
  const groups = data?.groups || EMPTY_GROUPS;
  const rawCustomers = data?.customers || EMPTY_CUSTOMERS;
  const guestTransactions = data?.guestTransactions || EMPTY_TRANSACTIONS;

  const filteredCustomers = useMemo(() => {
    return rawCustomers.filter((c) => {
      const matchesSearch =
        (c.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.phone_number?.includes(searchTerm) || false);

      if (!matchesSearch) return false;
      if (showTopSpendersOnly) return true; // Already filtered by server
      if (selectedGroupId === "all") return true;
      if (selectedGroupId === "ungrouped") return c.group_id === null;
      return c.group_id === selectedGroupId;
    });
  }, [rawCustomers, searchTerm, selectedGroupId, showTopSpendersOnly]);

  const filteredGuestTransactions = useMemo(() => {
    return guestTransactions.filter(
      (g) =>
        g.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.invoice_no.toLowerCase().includes(searchTerm)
    );
  }, [guestTransactions, searchTerm]);

  const currentGroupName = useMemo(() => {
    if (selectedGroupId === "all") return "Grouped Customers";
    if (selectedGroupId === "ungrouped") return "Ungrouped Customers";
    return groups.find((g) => g.id === selectedGroupId)?.name || "Unknown";
  }, [selectedGroupId, groups]);

  const selectedCustomer = useMemo(() => {
    return rawCustomers.find(c => c.id === selectedCustomerId) || null;
  }, [rawCustomers, selectedCustomerId]);
  
  const selectedCustomerGroupName = useMemo(() => {
    if (!selectedCustomer?.group_id) return "Ungrouped";
    return groups.find(g => g.id === selectedCustomer.group_id)?.name || "Ungrouped";
  }, [selectedCustomer, groups]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const refreshCustomers = () => queryClient.invalidateQueries({ queryKey });

  return {
    // Data
    groups,
    customers: filteredCustomers,
    guestTransactions: filteredGuestTransactions,
    rawCustomers,
    currentGroupName,
    selectedCustomer,
    selectedCustomerGroupName,
    startDate,
    endDate,
    
    // Status
    isLoading,
    isFetching,
    isError: !!error,
    error: error as any,
    selectedGroupId,
    showTopSpendersOnly,
    
    // Handlers
    handleDateChange,
    refreshCustomers,
  };
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const refreshData = useCallback(() => queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) && query.queryKey[0] === QUERY_KEY_PREFIX
  }), [queryClient]);

  return { refreshData };
}
