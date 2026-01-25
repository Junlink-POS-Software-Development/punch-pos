import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Classification,
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
} from "../lib/expenses.api";

export function useClassifications() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: classifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classifications"],
    queryFn: fetchClassifications,
  });

  const addClassification = async (name: string) => {
    setIsProcessing(true);
    try {
      await createClassification(name);
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    } finally {
      setIsProcessing(false);
    }
  };

  const editClassification = async (id: string, name: string) => {
    setIsProcessing(true);
    try {
      await updateClassification(id, name);
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeClassification = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteClassification(id);
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    classifications,
    isLoading,
    error: error ? (error as Error).message : null,
    addClassification,
    editClassification,
    removeClassification,
    isProcessing,
  };
}
