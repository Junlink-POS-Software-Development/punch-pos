import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Item } from "../components/item-registration/utils/itemTypes";
import {
  fetchItems,
  insertItem,
  updateItem,
  deleteItem,
} from "../components/item-registration/lib/item.api";

export const useItems = () => {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

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
    else alert(`${operation} failed: ${err.message}`);
  };

  const createMutation = useMutation({ mutationFn: insertItem });
  const updateMutation = useMutation({ mutationFn: updateItem });
  const deleteMutation = useMutation({ mutationFn: deleteItem });

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
