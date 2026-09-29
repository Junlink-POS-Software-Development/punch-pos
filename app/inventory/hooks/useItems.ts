import { useQuery, useQueryClient, useMutation, useInfiniteQuery, keepPreviousData, InfiniteData } from "@tanstack/react-query";
import { useState } from "react";
import { Item } from "../components/item-registration/utils/itemTypes";
import {
  fetchItems,
  fetchItemsPaginated,
  insertItem,
  updateItem,
  deleteItem,
  deleteItems,
} from "../components/item-registration/lib/item.api";
import { InventoryItem } from "../components/stocks-monitor/lib/inventory.api";

export const useInfiniteItems = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ["items-infinite", pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchItemsPaginated(pageParam as number, pageSize);
      return {
        data: result.data,
        count: result.count,
        nextPage: result.data.length === pageSize ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

export const useItems = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const mutationOptions = (operation: string) => ({
    onMutate: async (variables: any) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["items"] });
      await queryClient.cancelQueries({ queryKey: ["inventory-infinite"] });
      await queryClient.cancelQueries({ queryKey: ["inventory-all-pos"] });

      // Snapshot the previous values for rollback
      const prevItems = queryClient.getQueryData<Item[]>(["items"]);
      const prevInfiniteList = queryClient.getQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>({
        queryKey: ["inventory-infinite"],
      });
      const prevPos = queryClient.getQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"]);

      // Optimistically update to the new value
      if (operation === "addItem") {
        const itemVar = variables as Item;
        const newItem: InventoryItem = {
          item_id: itemVar.id || ("temp-" + Date.now()),
          item_name: itemVar.itemName,
          sku: itemVar.sku,
          category: itemVar.categoryName ?? null,
          unit_cost: itemVar.salesPrice ?? 0,
          sales_price: itemVar.sellingPrice ?? null,
          image_url: itemVar.imageUrl ?? null,
          quantity_in: 0,
          quantity_manual_out: 0,
          quantity_sold: 0,
          current_stock: 0,
          low_stock_threshold: itemVar.lowStockThreshold ?? null,
          description: itemVar.description ?? null,
          // Pharmacy fields
          generic_name: itemVar.genericName ?? null,
          dosage: itemVar.dosage ?? null,
          formulation: itemVar.formulation ?? null,
          is_rx: itemVar.isRx ?? false,
          brand_type: itemVar.brandType ?? null,
          batch_number: itemVar.batchNumber ?? null,
          expiry_date: itemVar.expiryDate ?? null,
          // Grocery fields
          is_weighed: itemVar.isWeighed ?? false,
          unit_of_measure: itemVar.unitOfMeasure ?? "pc",
          plu_code: itemVar.pluCode ?? null,
          tare_weight: itemVar.tareWeight ?? 0,
          pack_barcode: itemVar.packBarcode ?? null,
          pack_quantity: itemVar.packQuantity ?? 1,
          pack_selling_price: itemVar.packSellingPrice ?? null,
          is_perishable: itemVar.isPerishable ?? false,
        };

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) => (old ? [itemVar, ...old] : [itemVar]));

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            const newPages = [...old.pages];
            newPages[0] = {
              ...newPages[0],
              data: [newItem, ...newPages[0].data],
              count: (newPages[0].count || 0) + 1,
            };
            return { ...old, pages: newPages };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [newItem, ...old.data],
            count: (old.count || 0) + 1,
          };
        });

      } else if (operation === "editItem") {
        const updatedItem = variables as Item;

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) =>
          old?.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
        );

        const updateItemInList = (item: InventoryItem): InventoryItem => {
          if (item.item_id !== updatedItem.id) return item;
          return {
            ...item,
            item_name: updatedItem.itemName,
            sku: updatedItem.sku,
            category: updatedItem.categoryName ?? item.category,
            unit_cost: updatedItem.salesPrice ?? item.unit_cost,
            sales_price: updatedItem.sellingPrice ?? null,
            description: updatedItem.description ?? null,
            image_url: updatedItem.imageUrl ?? item.image_url,
            low_stock_threshold: updatedItem.lowStockThreshold ?? null,
            // Pharmacy fields
            generic_name: updatedItem.genericName !== undefined ? (updatedItem.genericName ?? null) : item.generic_name,
            dosage: updatedItem.dosage !== undefined ? (updatedItem.dosage ?? null) : item.dosage,
            formulation: updatedItem.formulation !== undefined ? (updatedItem.formulation ?? null) : item.formulation,
            is_rx: updatedItem.isRx !== undefined ? updatedItem.isRx : item.is_rx,
            brand_type: updatedItem.brandType !== undefined ? updatedItem.brandType : item.brand_type,
            batch_number: updatedItem.batchNumber !== undefined ? (updatedItem.batchNumber ?? null) : item.batch_number,
            expiry_date: updatedItem.expiryDate !== undefined ? (updatedItem.expiryDate ?? null) : item.expiry_date,
            // Grocery fields
            is_weighed: updatedItem.isWeighed !== undefined ? updatedItem.isWeighed : item.is_weighed,
            unit_of_measure: updatedItem.unitOfMeasure !== undefined ? updatedItem.unitOfMeasure : item.unit_of_measure,
            plu_code: updatedItem.pluCode !== undefined ? (updatedItem.pluCode ?? null) : item.plu_code,
            tare_weight: updatedItem.tareWeight !== undefined ? updatedItem.tareWeight : item.tare_weight,
            pack_barcode: updatedItem.packBarcode !== undefined ? (updatedItem.packBarcode ?? null) : item.pack_barcode,
            pack_quantity: updatedItem.packQuantity !== undefined ? updatedItem.packQuantity : item.pack_quantity,
            pack_selling_price: updatedItem.packSellingPrice !== undefined ? updatedItem.packSellingPrice : item.pack_selling_price,
            is_perishable: updatedItem.isPerishable !== undefined ? updatedItem.isPerishable : item.is_perishable,
          };
        };

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map(updateItemInList),
              })),
            };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(updateItemInList),
          };
        });

      } else if (operation === "removeItem") {
        const id = variables as string;

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) =>
          old?.filter((item) => item.id !== id)
        );

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((item) => item.item_id !== id),
                count: Math.max(0, (page.count || 0) - (page.data.some((i) => i.item_id === id) ? 1 : 0)),
              })),
            };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.item_id !== id),
            count: Math.max(0, (old.count || 0) - (old.data.some((i) => i.item_id === id) ? 1 : 0)),
          };
        });

      } else if (operation === "removeItems") {
        const ids = variables as string[];
        const idSet = new Set(ids);

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) =>
          old?.filter((item) => item.id && !idSet.has(item.id))
        );

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[]; count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => {
                const removedCount = page.data.filter((item) => idSet.has(item.item_id)).length;
                return {
                  ...page,
                  data: page.data.filter((item) => !idSet.has(item.item_id)),
                  count: Math.max(0, (page.count || 0) - removedCount),
                };
              }),
            };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[]; count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          const removedCount = old.data.filter((item) => idSet.has(item.item_id)).length;
          return {
            ...old,
            data: old.data.filter((item) => !idSet.has(item.item_id)),
            count: Math.max(0, (old.count || 0) - removedCount),
          };
        });
      }

      console.log(`🔄 [useItems] [${operation}] Optimistically updating query caches for:`, variables);
      return { prevItems, prevInfiniteList, prevPos };
    },
    onError: (err: any, variables: any, context: any) => {
      console.error(`💥 [useItems] [${operation}] Mutation failed. Rolling back optimistic updates:`, err);
      if (context?.prevItems) {
        queryClient.setQueryData(["items"], context.prevItems);
      }
      if (context?.prevInfiniteList) {
        context.prevInfiniteList.forEach(([key, val]: [any, any]) => {
          queryClient.setQueryData(key, val);
        });
      }
      if (context?.prevPos) {
        queryClient.setQueryData(["inventory-all-pos"], context.prevPos);
      }
      console.error(`${operation} failed:`, err);
    },
    onSettled: () => {
      console.log(`🏁 [useItems] [${operation}] Mutation settled. Refreshing inventory caches.`);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      setIsProcessing(false);
    },
  });

  const addMutation = useMutation({
    mutationFn: insertItem,
    ...mutationOptions("addItem"),
  });

  const editMutation = useMutation({
    mutationFn: updateItem,
    ...mutationOptions("editItem"),
  });

  const removeMutation = useMutation({
    mutationFn: deleteItem,
    ...mutationOptions("removeItem"),
  });

  const removeManyMutation = useMutation({
    mutationFn: deleteItems,
    ...mutationOptions("removeItems"),
  });

  const addItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    console.log("📡 [useItems] addItem triggered for:", item.itemName);
    setIsProcessing(true);
    addMutation.mutate(item, {
      onSuccess: () => {
        console.log("✅ [useItems] addItem mutation completed successfully for:", item.itemName);
        options?.onSuccess?.();
      },
      onError: (err) => {
        console.error("❌ [useItems] addItem mutation onError caught:", err);
        options?.onError?.(err as Error);
      },
    });
  };

  const editItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    editMutation.mutate(item, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error),
    });
  };

  const removeItem = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    removeMutation.mutate(id, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error),
    });
  };

  const removeItems = async (
    ids: string[],
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    removeManyMutation.mutate(ids, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error),
    });
  };

  return {
    items,
    isLoading,
    error,
    isProcessing,
    addItem,
    editItem,
    removeItem,
    removeItems,
  };
};
