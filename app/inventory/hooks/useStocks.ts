import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchStocks,
  insertStock,
  updateStock,
  deleteStock,
  StockData,
} from "../components/stock-management/lib/stocks.api";

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

export const useStocks = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
  });

  const handleMutationSuccess = (callback?: () => void) => {
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
    setIsProcessing(false);
    callback?.();
  };

  const handleMutationError = (
    error: Error,
    callback?: (err: Error) => void
  ) => {
    console.error("Mutation failed:", error);
    setIsProcessing(false);
    callback?.(error);
    if (!callback) alert(`Operation failed: ${error.message}`);
  };

  const addStockEntry = async (data: StockInput, options?: StockMutationOptions) => {
    setIsProcessing(true);
    try {
      await insertStock(data);
      handleMutationSuccess(options?.onSuccess);
    } catch (err) {
      handleMutationError(err as Error, options?.onError);
    }
  };

  const editStockEntry = async (
    id: string,
    data: StockInput,
    options?: StockMutationOptions
  ) => {
    setIsProcessing(true);
    try {
      await updateStock({
        id,
        flow: data.stockFlow,
        quantity: data.quantity,
        capital_price: data.capitalPrice,
        notes: data.notes,
      });
      handleMutationSuccess(options?.onSuccess);
    } catch (err) {
      handleMutationError(err as Error, options?.onError);
    }
  };

  const removeStockEntry = async (id: string, options?: StockMutationOptions) => {
    setIsProcessing(true);
    try {
      await deleteStock(id);
      handleMutationSuccess(options?.onSuccess);
    } catch (err) {
      handleMutationError(err as Error, options?.onError);
    }
  };

  const addBatchStockEntry = async (items: StockInput[], options?: StockMutationOptions) => {
    setIsProcessing(true);
    try {
      // Import this dynamically or ensuring it's imported at top
      await import("../components/stock-management/lib/stocks.api").then(mod => 
        mod.insertStockBatch(items)
      );
      handleMutationSuccess(options?.onSuccess);
    } catch (err) {
      handleMutationError(err as Error, options?.onError);
    }
  };

  return {
    stocks,
    isLoading,
    isProcessing,
    addStockEntry,
    editStockEntry,
    removeStockEntry,
    addBatchStockEntry,
  };
};
