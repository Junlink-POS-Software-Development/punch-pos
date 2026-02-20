import { useQuery, useQueryClient, useMutation, useInfiniteQuery, keepPreviousData, InfiniteData } from "@tanstack/react-query";
import { useState } from "react";
import { Item } from "../components/item-registration/utils/itemTypes";
import {
  fetchItems,
  fetchItemsPaginated,
  insertItem,
  updateItem,
  deleteItem,
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

      // Snapshot the previous value
      const prevItems = queryClient.getQueryData(["items"]);
      const prevInfinite = queryClient.getQueryData(["inventory-infinite"]);
      const prevPos = queryClient.getQueryData(["inventory-all-pos"]);

      // Optimistically update to the new value
      if (operation === "addItem") {
        const itemVar = variables as Item;
        const newItem: InventoryItem = {
          item_id: "temp-" + Date.now(),
          item_name: itemVar.itemName,
          sku: itemVar.sku,
          category: itemVar.categoryName ?? null,
          unit_cost: itemVar.salesPrice,
          sales_price: itemVar.sellingPrice ?? null,
          image_url: itemVar.imageUrl ?? null,
          quantity_in: 0,
          quantity_manual_out: 0,
          quantity_sold: 0,
          current_stock: 0,
          low_stock_threshold: itemVar.lowStockThreshold ?? null,
          description: itemVar.description ?? null,
        };

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) => old ? [itemVar, ...old] : [itemVar]);

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[], count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            const newPages = [...old.pages];
            newPages[0] = {
              ...newPages[0],
              data: [newItem, ...newPages[0].data],
              count: (newPages[0].count || 0) + 1
            };
            return { ...old, pages: newPages };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[], count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [newItem, ...old.data],
            count: (old.count || 0) + 1
          };
        });

      } else if (operation === "editItem") {
        const updatedItem = variables as Item;
        
        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) => 
          old?.map(item => item.id === updatedItem.id ? updatedItem : item)
        );

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[], count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map(page => ({
                ...page,
                data: page.data.map(item => item.item_id === updatedItem.id ? {
                  ...item,
                  item_name: updatedItem.itemName,
                  sku: updatedItem.sku,
                  category: updatedItem.categoryName ?? item.category,
                  unit_cost: updatedItem.salesPrice,
                  sales_price: updatedItem.sellingPrice ?? null,
                  description: updatedItem.description ?? null,
                  image_url: updatedItem.imageUrl ?? item.image_url,
                  low_stock_threshold: updatedItem.lowStockThreshold ?? null
                } : item)
              }))
            };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[], count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(item => item.item_id === updatedItem.id ? {
              ...item,
              item_name: updatedItem.itemName,
              sku: updatedItem.sku,
              category: updatedItem.categoryName ?? item.category,
              unit_cost: updatedItem.salesPrice,
              sales_price: updatedItem.sellingPrice ?? null,
              description: updatedItem.description ?? null,
              image_url: updatedItem.imageUrl ?? item.image_url,
              low_stock_threshold: updatedItem.lowStockThreshold ?? null
            } : item)
          };
        });

      } else if (operation === "removeItem") {
        const id = variables as string;

        // Update "items" cache
        queryClient.setQueryData<Item[]>(["items"], (old) => 
          old?.filter(item => item.id !== id)
        );

        // Update "inventory-infinite" cache
        queryClient.setQueriesData<InfiniteData<{ data: InventoryItem[], count: number }>>(
          { queryKey: ["inventory-infinite"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map(page => ({
                ...page,
                data: page.data.filter(item => item.item_id !== id),
                count: Math.max(0, (page.count || 0) - (page.data.some(i => i.item_id === id) ? 1 : 0))
              }))
            };
          }
        );

        // Update "inventory-all-pos" cache
        queryClient.setQueryData<{ data: InventoryItem[], count: number }>(["inventory-all-pos"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter(item => item.item_id !== id),
            count: Math.max(0, (old.count || 0) - (old.data.some(i => i.item_id === id) ? 1 : 0))
          };
        });
      }

      return { prevItems, prevInfinite, prevPos };
    },
    onError: (err: any, variables: any, context: any) => {
      if (context?.prevItems) {
        queryClient.setQueryData(["items"], context.prevItems);
      }
      if (context?.prevInfinite) {
        queryClient.setQueryData(["inventory-infinite"], context.prevInfinite);
      }
      if (context?.prevPos) {
        queryClient.setQueryData(["inventory-all-pos"], context.prevPos);
      }
      console.error(`${operation} failed:`, err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
      setIsProcessing(false);
    }
  });

  const addMutation = useMutation({
    mutationFn: insertItem,
    ...mutationOptions("addItem")
  });

  const editMutation = useMutation({
    mutationFn: updateItem,
    ...mutationOptions("editItem")
  });

  const removeMutation = useMutation({
    mutationFn: deleteItem,
    ...mutationOptions("removeItem")
  });

  const addItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    addMutation.mutate(item, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error)
    });
  };

  const editItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    editMutation.mutate(item, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error)
    });
  };

  const removeItem = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsProcessing(true);
    removeMutation.mutate(id, {
      onSuccess: () => options?.onSuccess?.(),
      onError: (err) => options?.onError?.(err as Error)
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
  };
};
