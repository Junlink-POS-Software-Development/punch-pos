"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Item } from "../utils/itemTypes";
import {
  fetchItems,
  insertItem,
  updateItem,
  deleteItem,
} from "../lib/item.api";

interface ItemsContextType {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
  isProcessing: boolean; // Global loading state for mutations

  // Actions
  addItem: (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => void;
  editItem: (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => void;
  removeItem: (
    id: string,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Data
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  // 2. Helpers for Mutations
  const handleSuccess = (operation: string, callback?: () => void) => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    if (callback) callback();
  };

  const handleError = (
    err: Error,
    operation: string,
    callback?: (err: Error) => void
  ) => {
    console.error(`${operation} failed:`, err);
    if (callback) callback(err);
    else alert(`${operation} failed: ${err.message}`); // Fallback alert
  };

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: insertItem,
  });

  const updateMutation = useMutation({
    mutationFn: updateItem,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
  });

  // 4. Exposed Functions
  const addItem = (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    createMutation.mutate(item, {
      onSuccess: () => handleSuccess("Create", options?.onSuccess),
      onError: (err) => handleError(err, "Create", options?.onError),
    });
  };

  const editItem = (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    updateMutation.mutate(item, {
      onSuccess: () => handleSuccess("Update", options?.onSuccess),
      onError: (err) => handleError(err, "Update", options?.onError),
    });
  };

  const removeItem = (
    id: string,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    deleteMutation.mutate(id, {
      onSuccess: () => handleSuccess("Delete", options?.onSuccess),
      onError: (err) => handleError(err, "Delete", options?.onError),
    });
  };

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <ItemsContext.Provider
      value={{
        items,
        isLoading,
        error,
        isProcessing,
        addItem,
        editItem,
        removeItem,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

// Hook to use the context
export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return context;
};
