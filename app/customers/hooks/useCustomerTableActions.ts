"use client";

import { useCallback } from "react";
import { Table } from "@tanstack/react-table";
import { useCustomerStore } from "../store/useCustomerStore";
import { useCustomerMutations } from "./useCustomerData";
import {
  updateCustomerGroup,
  deleteCustomer,
  bulkUpdateCustomerGroup,
  toggleCustomerLock,
} from "../api/services";
import { Customer } from "../lib/types";

// ─── Customer Table Action Handlers ───────────────────────────────────────────

export function useCustomerTableActions() {
  const setViewMode = useCustomerStore((s) => s.setViewMode);
  const setSelectedCustomerId = useCustomerStore((s) => s.setSelectedCustomerId);
  const { refreshData } = useCustomerMutations();

  const handleViewCustomer = useCallback(
    (customerId: string) => {
      setSelectedCustomerId(customerId);
      setViewMode("detail");
    },
    [setSelectedCustomerId, setViewMode]
  );

  const handleToggleLock = useCallback(
    async (customerId: string, isLocked: boolean, metadata: Record<string, any>) => {
      await toggleCustomerLock(customerId, !isLocked, metadata);
      refreshData();
    },
    [refreshData]
  );

  const handleDeleteCustomer = useCallback(
    async (customerId: string, isLocked: boolean) => {
      if (isLocked) {
        alert("This customer is locked and cannot be deleted.");
        return;
      }
      if (!confirm("Are you sure you want to delete?")) return;
      await deleteCustomer(customerId);
      refreshData();
    },
    [refreshData]
  );

  const handleGroupChange = useCallback(
    async (customerId: string, groupId: string, isLocked: boolean) => {
      if (isLocked) {
        alert("This customer is locked and cannot be moved.");
        return;
      }
      if (!confirm("Are you sure you want to move this customer?")) return;
      await updateCustomerGroup(customerId, groupId);
      refreshData();
    },
    [refreshData]
  );

  const handleBulkMove = useCallback(
    async (table: Table<Customer>, groupId: string) => {
      const selectedRows = table.getSelectedRowModel().rows;
      if (selectedRows.length === 0) return;

      const lockedCustomers = selectedRows.filter(
        (r) => r.original.document_metadata?.isLocked
      );
      if (lockedCustomers.length > 0) {
        alert(`Cannot move. ${lockedCustomers.length} selected customer(s) are locked.`);
        return;
      }

      const ids = selectedRows.map((r) => r.original.id);
      await bulkUpdateCustomerGroup(ids, groupId);
      refreshData();
      table.resetRowSelection();
    },
    [refreshData]
  );

  return {
    handleViewCustomer,
    handleToggleLock,
    handleDeleteCustomer,
    handleGroupChange,
    handleBulkMove,
  };
}
