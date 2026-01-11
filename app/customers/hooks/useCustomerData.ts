import useSWR, { useSWRConfig } from "swr";
import { fetchCustomerFeatureData } from "../api/services";
import { useCustomerStore } from "../store/useCustomerStore";

const SWR_KEY = "customer-feature-data";

export const useCustomerData = () => {
  const { data, error, isLoading } = useSWR(SWR_KEY, fetchCustomerFeatureData);

  const { searchTerm, selectedGroupId } = useCustomerStore();

  const groups = data?.groups || [];
  const rawCustomers = data?.customers || [];
  // [NEW] Get guest transactions
  const guestTransactions = data?.guestTransactions || [];

  const filteredCustomers = rawCustomers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone_number.includes(searchTerm);

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

  return {
    groups,
    customers: filteredCustomers,
    guestTransactions: filteredGuestTransactions, // [NEW] Export
    rawCustomers,
    currentGroupName,
    isLoading,
    isError: error,
    selectedGroupId, // Export this so we can check it in the layout
  };
};

// Hook to handle mutations easily
export const useCustomerMutations = () => {
  const { mutate } = useSWRConfig();

  const refreshData = () => mutate(SWR_KEY);

  return { refreshData };
};
