"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCustomerFeatureData } from "../lib/customer.api";
import { useCustomerStore } from "../store/useCustomerStore";
import { CustomerGroup, Customer, GuestTransaction } from "../lib/types";

const QUERY_KEY_PREFIX = "customer-feature-data";

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
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const { searchTerm, selectedGroupId, selectedCustomerId } = useCustomerStore();

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const queryKey = [QUERY_KEY_PREFIX, startDate, endDate];

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchCustomerFeatureData(startDate, endDate),
    initialData: startDate === getTodayDate() && endDate === getTodayDate() ? initialData : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Filtered Data ──────────────────────────────────────────────────────────
  const groups = data?.groups || [];
  const rawCustomers = data?.customers || [];
  const guestTransactions = data?.guestTransactions || [];

  const filteredCustomers = rawCustomers.filter((c) => {
    const matchesSearch =
      (c.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (c.phone_number?.includes(searchTerm) || false);

    if (!matchesSearch) return false;
    if (selectedGroupId === "all") return true;
    if (selectedGroupId === "ungrouped") return c.group_id === null;
    return c.group_id === selectedGroupId;
  });

  const filteredGuestTransactions = guestTransactions.filter(
    (g) =>
      g.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.invoice_no.toLowerCase().includes(searchTerm)
  );

  const currentGroupName =
    selectedGroupId === "all"
      ? "Grouped Customers"
      : selectedGroupId === "ungrouped"
      ? "Ungrouped Customers"
      : groups.find((g) => g.id === selectedGroupId)?.name || "Unknown";

  const selectedCustomer = rawCustomers.find(c => c.id === selectedCustomerId) || null;
  
  const selectedCustomerGroupName = selectedCustomer?.group_id 
    ? groups.find(g => g.id === selectedCustomer.group_id)?.name 
    : "Ungrouped";

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
    isError: !!error,
    error: error as any,
    selectedGroupId,
    
    // Handlers
    handleDateChange,
    refreshCustomers,
  };
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const refreshData = () => queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) && query.queryKey[0] === QUERY_KEY_PREFIX
  });

  return { refreshData };
}
