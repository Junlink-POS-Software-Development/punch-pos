import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Item } from "../components/item-registration/utils/itemTypes";
import {
  fetchItems,
  insertItem,
  updateItem,
  deleteItem,
} from "../components/item-registration/lib/item.api";

export const useItems = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const data = await fetchItems();
      return data;
    },
  });

  const handleSuccess = (operation: string, callback?: () => void) => {
    console.log(`${operation} successful`);
    queryClient.invalidateQueries({ queryKey: ["items"] });
    setIsProcessing(false);
    if (callback) callback();
  };

  const handleError = (
    err: Error,
    operation: string,
    callback?: (err: Error) => void
  ) => {
    console.error(`${operation} failed:`, err);
    setIsProcessing(false);
    if (callback) callback(err);
    else alert(`${operation} failed: ${err.message}`);
  };

  const addItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    console.log("Adding item:", item);
    setIsProcessing(true);
    try {
      await insertItem(item);
      handleSuccess("Create", options?.onSuccess);
    } catch (err) {
      handleError(err as Error, "Create", options?.onError);
    }
  };

  const editItem = async (
    item: Item,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    console.log("Updating item:", item);
    setIsProcessing(true);
    try {
      await updateItem(item);
      handleSuccess("Update", options?.onSuccess);
    } catch (err) {
      handleError(err as Error, "Update", options?.onError);
    }
  };

  const removeItem = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    console.log("Deleting item ID:", id);
    setIsProcessing(true);
    try {
      await deleteItem(id);
      handleSuccess("Delete", options?.onSuccess);
    } catch (err) {
      handleError(err as Error, "Delete", options?.onError);
    }
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
