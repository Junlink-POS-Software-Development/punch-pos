import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerFeatureData } from "../api/services";
import { useCustomerStore } from "../store/useCustomerStore";
import { useState } from "react";

const QUERY_KEY_PREFIX = "customer-feature-data";

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split("T")[0];

// Get today's date as default
const getTodayDate = () => formatDate(new Date());

export const useCustomerData = () => {
  const queryClient = useQueryClient();
  // Date filter state - default to today's date
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());

  // Generate query key with date parameters to trigger refetch when dates change
  const queryKey = [QUERY_KEY_PREFIX, startDate, endDate];

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchCustomerFeatureData(startDate, endDate),
  });

  const { searchTerm, selectedGroupId, selectedCustomerId } = useCustomerStore();

  const groups = data?.groups || [];
  const rawCustomers = data?.customers || [];
  // [NEW] Get guest transactions
  const guestTransactions = data?.guestTransactions || [];

  const filteredCustomers = rawCustomers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone_number?.includes(searchTerm);

    if (!matchesSearch) return false;
    if (selectedGroupId === "all") return true;
    if (selectedGroupId === "ungrouped") return c.group_id === null;
    return c.group_id === selectedGroupId;
  });

  // [NEW] Filter guest transactions if user searches
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


  // [NEW] Find the selected customer for the detail view
  
  const selectedCustomer = rawCustomers.find(c => c.id === selectedCustomerId) || null;
  
  // [NEW] Find the group name for the specific customer
  const selectedCustomerGroupName = selectedCustomer?.group_id 
    ? groups.find(g => g.id === selectedCustomer.group_id)?.name 
    : "Ungrouped";

  // Date change handler
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return {
    groups,
    customers: filteredCustomers,
    guestTransactions: filteredGuestTransactions,
    rawCustomers,
    currentGroupName,
    
    // [NEW] Export these
    selectedCustomer,
    selectedCustomerGroupName,
    
    // Date filter state and handlers
    startDate,
    endDate,
    handleDateChange,
    
    isLoading,
    isError: error,
    selectedGroupId,
    refreshCustomers: () => queryClient.invalidateQueries({ queryKey }),
  };
};

// Hook to handle mutations easily
export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  const refreshData = () => queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) && query.queryKey[0] === QUERY_KEY_PREFIX
  });

  return { refreshData };
};
