"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStocks,
  insertStock,
  updateStock,
  deleteStock,
  StockData,
} from "../lib/stocks.api";

export interface StockInput {
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice: number;
  notes?: string;
}

interface StockMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface StockContextType {
  stocks: StockData[];
  isLoading: boolean;
  isProcessing: boolean;
  addStockEntry: (data: StockInput, options?: StockMutationOptions) => void;
  editStockEntry: (
    id: string,
    data: StockInput,
    options?: StockMutationOptions
  ) => void;
  removeStockEntry: (id: string, options?: StockMutationOptions) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: stocks = [], isLoading } = useQuery<StockData[]>({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
  });

  const handleMutationSuccess = (callback?: () => void) => {
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
    callback?.();
  };

  const handleMutationError = (
    error: Error,
    callback?: (err: Error) => void
  ) => {
    console.error("Mutation failed:", error);
    callback?.(error);
    if (!callback) alert(`Operation failed: ${error.message}`);
  };

  const addMutation = useMutation({ mutationFn: insertStock });
  const deleteMutation = useMutation({ mutationFn: deleteStock });
  const updateMutation = useMutation({ mutationFn: updateStock });

  const addStockEntry = (data: StockInput, options?: StockMutationOptions) => {
    addMutation.mutate(data, {
      onSuccess: () => handleMutationSuccess(options?.onSuccess),
      onError: (err) => handleMutationError(err, options?.onError),
    });
  };

  const editStockEntry = (
    id: string,
    data: StockInput,
    options?: StockMutationOptions
  ) => {
    // Fix: The mutationFn for updateStock expects an object with id and the StockInput properties.
    updateMutation.mutate(
      {
        id,
        flow: data.stockFlow,
        quantity: data.quantity,
        capital_price: data.capitalPrice,
        notes: data.notes,
      },
      {
        onSuccess: () => handleMutationSuccess(options?.onSuccess),
        onError: (err) => handleMutationError(err, options?.onError),
      }
    );
  };

  const removeStockEntry = (id: string, options?: StockMutationOptions) => {
    deleteMutation.mutate(id, {
      onSuccess: () => handleMutationSuccess(options?.onSuccess),
      onError: (err) => handleMutationError(err, options?.onError),
    });
  };

  const isProcessing =
    addMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending;

  return (
    <StockContext.Provider
      value={{
        stocks,
        isLoading,
        isProcessing,
        addStockEntry,
        editStockEntry,
        removeStockEntry,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error("useStocks must be used within StockProvider");
  return context;
};
