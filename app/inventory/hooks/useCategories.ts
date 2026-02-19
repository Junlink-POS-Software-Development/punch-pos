import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Category,
  fetchCategories,
  createCategory,
  updateCategory as apiUpdate,
  deleteCategory as apiDelete,
} from "../components/item-registration/lib/categories.api";

export type { Category };

export function useCategories() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const addCategory = async (name: string) => {
    setIsProcessing(true);
    try {
      // Return the result so the UI can get the new ID
      const newCategory = await createCategory(name);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      return newCategory; 
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = async (id: string, name: string) => {
    setIsProcessing(true);
    try {
      await apiUpdate(id, name);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsProcessing(true);
    try {
      await apiDelete(id);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    categories,
    isLoading,
    error: error ? (error as Error).message : null,
    addCategory,
    updateCategory,
    deleteCategory,
    isProcessing,
  };
}