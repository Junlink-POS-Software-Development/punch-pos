import { useQuery, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchStocks,
  insertStock,
  updateStock,
  deleteStock,
  insertStockBatch,
  StockData,
} from "../components/stock-management/lib/stocks.api";
import { InventoryItem } from "../components/stocks-monitor/lib/inventory.api";

export interface StockInput {
  itemId?: string;
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice?: number;
  notes?: string;
  expiryDate?: string;
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
    staleTime: 1000 * 60 * 2,
  });

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
    // 1. Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["stocks"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-infinite"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-all-pos"] });

    // 2. Snapshot previous values for rollback
    const prevStocks = queryClient.getQueryData<StockData[]>(["stocks"]);
    const prevInfiniteList = queryClient.getQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>({
      queryKey: ["inventory-infinite"],
    });
    const prevPos = queryClient.getQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"]);

    // 3. Optimistic StockData item for the Stocks Flow table
    const optimisticStock: StockData = {
      id: "temp-" + Date.now(),
      item_name: data.itemName,
      flow: data.stockFlow,
      quantity: data.quantity,
      capital_price: data.capitalPrice ?? 0,
      notes: data.notes || null,
      time_stamp: new Date().toISOString(),
      user_id: "",
      store_id: "",
      expiry_date: data.expiryDate || null,
      batch_remaining: data.stockFlow === "stock-in" ? data.quantity : 0,
    };

    queryClient.setQueryData<StockData[]>(["stocks"], (old) =>
      old ? [optimisticStock, ...old] : [optimisticStock]
    );

    // 4. Optimistically adjust stock in inventory-infinite
    const qtyChange = data.stockFlow === "stock-in" ? data.quantity : -data.quantity;
    queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
      { queryKey: ["inventory-infinite"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.item_name.toLowerCase() === data.itemName.toLowerCase() ||
              (data.itemId && item.item_id === data.itemId)
                ? {
                    ...item,
                    current_stock: Math.max(0, item.current_stock + qtyChange),
                    quantity_in:
                      data.stockFlow === "stock-in"
                        ? item.quantity_in + data.quantity
                        : item.quantity_in,
                    quantity_manual_out:
                      data.stockFlow === "stock-out"
                        ? item.quantity_manual_out + data.quantity
                        : item.quantity_manual_out,
                  }
                : item
            ),
          })),
        };
      }
    );

    // 5. Optimistically adjust in inventory-all-pos
    queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(
      ["inventory-all-pos"],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item.item_name.toLowerCase() === data.itemName.toLowerCase() ||
            (data.itemId && item.item_id === data.itemId)
              ? {
                  ...item,
                  current_stock: Math.max(0, item.current_stock + qtyChange),
                  quantity_in:
                    data.stockFlow === "stock-in"
                      ? item.quantity_in + data.quantity
                      : item.quantity_in,
                  quantity_manual_out:
                    data.stockFlow === "stock-out"
                      ? item.quantity_manual_out + data.quantity
                      : item.quantity_manual_out,
                }
              : item
          ),
        };
      }
    );

    try {
      await insertStock(data);
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
      setIsProcessing(false);
      options?.onSuccess?.();
    } catch (err) {
      // Rollback on error
      if (prevStocks) queryClient.setQueryData(["stocks"], prevStocks);
      if (prevInfiniteList) {
        prevInfiniteList.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (prevPos) queryClient.setQueryData(["inventory-all-pos"], prevPos);
      handleMutationError(err as Error, options?.onError);
    }
  };

  const editStockEntry = async (
    id: string,
    data: StockInput,
    options?: StockMutationOptions
  ) => {
    setIsProcessing(true);
    await queryClient.cancelQueries({ queryKey: ["stocks"] });
    const prevStocks = queryClient.getQueryData<StockData[]>(["stocks"]);

    // Optimistically update stock entry in stocks cache
    queryClient.setQueryData<StockData[]>(["stocks"], (old) =>
      old?.map((item) =>
        item.id === id
          ? {
              ...item,
              flow: data.stockFlow,
              quantity: data.quantity,
              capital_price: data.capitalPrice ?? item.capital_price,
              notes: data.notes ?? item.notes,
              expiry_date: data.expiryDate ?? item.expiry_date,
            }
          : item
      )
    );

    try {
      await updateStock({
        id,
        flow: data.stockFlow,
        quantity: data.quantity,
        capital_price: data.capitalPrice ?? 0,
        notes: data.notes,
      });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
      setIsProcessing(false);
      options?.onSuccess?.();
    } catch (err) {
      if (prevStocks) queryClient.setQueryData(["stocks"], prevStocks);
      handleMutationError(err as Error, options?.onError);
    }
  };

  const removeStockEntry = async (id: string, options?: StockMutationOptions) => {
    setIsProcessing(true);
    // 1. Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["stocks"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-infinite"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-all-pos"] });

    const prevStocks = queryClient.getQueryData<StockData[]>(["stocks"]);
    const prevInfiniteList = queryClient.getQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>({
      queryKey: ["inventory-infinite"],
    });
    const prevPos = queryClient.getQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"]);

    // Find the record being deleted to optimistically reverse stock flow
    const target = prevStocks?.find((s) => s.id === id);

    // 2. Optimistically remove from stocks cache
    queryClient.setQueryData<StockData[]>(["stocks"], (old) =>
      old ? old.filter((item) => item.id !== id) : []
    );

    // 3. Optimistically reverse stock count in inventory caches
    if (target) {
      const reverseChange = target.flow === "stock-in" ? -target.quantity : target.quantity;

      queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
        { queryKey: ["inventory-infinite"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.item_name.toLowerCase() === target.item_name.toLowerCase()
                  ? {
                      ...item,
                      current_stock: Math.max(0, item.current_stock + reverseChange),
                      quantity_in:
                        target.flow === "stock-in"
                          ? Math.max(0, item.quantity_in - target.quantity)
                          : item.quantity_in,
                      quantity_manual_out:
                        target.flow === "stock-out"
                          ? Math.max(0, item.quantity_manual_out - target.quantity)
                          : item.quantity_manual_out,
                    }
                  : item
              ),
            })),
          };
        }
      );

      queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(
        ["inventory-all-pos"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.item_name.toLowerCase() === target.item_name.toLowerCase()
                ? {
                    ...item,
                    current_stock: Math.max(0, item.current_stock + reverseChange),
                    quantity_in:
                      target.flow === "stock-in"
                        ? Math.max(0, item.quantity_in - target.quantity)
                        : item.quantity_in,
                    quantity_manual_out:
                      target.flow === "stock-out"
                        ? Math.max(0, item.quantity_manual_out - target.quantity)
                        : item.quantity_manual_out,
                  }
                : item
            ),
          };
        }
      );
    }

    try {
      await deleteStock(id);
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
      setIsProcessing(false);
      options?.onSuccess?.();
    } catch (err) {
      if (prevStocks) queryClient.setQueryData(["stocks"], prevStocks);
      if (prevInfiniteList) {
        prevInfiniteList.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (prevPos) queryClient.setQueryData(["inventory-all-pos"], prevPos);
      handleMutationError(err as Error, options?.onError);
    }
  };

  const addBatchStockEntry = async (
    items: StockInput[],
    options?: StockMutationOptions
  ) => {
    setIsProcessing(true);
    await queryClient.cancelQueries({ queryKey: ["stocks"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-infinite"] });
    await queryClient.cancelQueries({ queryKey: ["inventory-all-pos"] });

    const prevStocks = queryClient.getQueryData<StockData[]>(["stocks"]);
    const prevInfiniteList = queryClient.getQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>({
      queryKey: ["inventory-infinite"],
    });
    const prevPos = queryClient.getQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"]);

    // 1. Optimistic batch entries
    const optimisticBatch: StockData[] = items.map((item, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      item_name: item.itemName,
      flow: item.stockFlow,
      quantity: item.quantity,
      capital_price: item.capitalPrice ?? 0,
      notes: item.notes || "Batch Update",
      time_stamp: new Date().toISOString(),
      user_id: "",
      store_id: "",
      expiry_date: item.expiryDate || null,
      batch_remaining: item.stockFlow === "stock-in" ? item.quantity : 0,
    }));

    queryClient.setQueryData<StockData[]>(["stocks"], (old) =>
      old ? [...optimisticBatch, ...old] : optimisticBatch
    );

    // 2. Optimistically calculate stock changes per item
    const itemQtyMap = new Map<string, number>();
    for (const entry of items) {
      const key = entry.itemName.toLowerCase();
      const change = entry.stockFlow === "stock-in" ? entry.quantity : -entry.quantity;
      itemQtyMap.set(key, (itemQtyMap.get(key) || 0) + change);
    }

    queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
      { queryKey: ["inventory-infinite"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((item) => {
              const change = itemQtyMap.get(item.item_name.toLowerCase());
              if (change !== undefined) {
                return {
                  ...item,
                  current_stock: Math.max(0, item.current_stock + change),
                  quantity_in:
                    change > 0 ? item.quantity_in + change : item.quantity_in,
                  quantity_manual_out:
                    change < 0
                      ? item.quantity_manual_out + Math.abs(change)
                      : item.quantity_manual_out,
                };
              }
              return item;
            }),
          })),
        };
      }
    );

    queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(
      ["inventory-all-pos"],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item) => {
            const change = itemQtyMap.get(item.item_name.toLowerCase());
            if (change !== undefined) {
              return {
                ...item,
                current_stock: Math.max(0, item.current_stock + change),
                quantity_in:
                  change > 0 ? item.quantity_in + change : item.quantity_in,
                quantity_manual_out:
                  change < 0
                    ? item.quantity_manual_out + Math.abs(change)
                    : item.quantity_manual_out,
              };
            }
            return item;
          }),
        };
      }
    );

    try {
      await insertStockBatch(items);
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
      setIsProcessing(false);
      options?.onSuccess?.();
    } catch (err) {
      if (prevStocks) queryClient.setQueryData(["stocks"], prevStocks);
      if (prevInfiniteList) {
        prevInfiniteList.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (prevPos) queryClient.setQueryData(["inventory-all-pos"], prevPos);
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
