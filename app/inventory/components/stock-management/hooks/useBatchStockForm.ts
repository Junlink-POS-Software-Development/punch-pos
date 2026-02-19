import { useState, useMemo } from "react";
import { Item } from "../../item-registration/utils/itemTypes";
import { useStocks } from "../../../hooks/useStocks";

export type BatchField = {
  selected: boolean;
  addQuantity: number;
  capitalPrice: number;
  notes: string;
};

export type BatchStep = "selection" | "review";

export const useBatchStockForm = (items: Item[]) => {
  const [batchData, setBatchData] = useState<Record<string, BatchField>>({});
  const [step, setStep] = useState<BatchStep>("selection");
  const { addBatchStockEntry, isProcessing } = useStocks();

  // Helper to safely get current state for an item
  const getItemState = (item: Item): BatchField => {
    return (
      batchData[item.id!] || {
        selected: false,
        addQuantity: 0,
        capitalPrice: item.salesPrice || 0,
        notes: "",
      }
    );
  };

  // Update a specific field for an item
  // Note: Only updates data, does NOT auto-select.
  const updateField = (item: Item, field: keyof BatchField, value: any) => {
    setBatchData((prev) => {
      const current = prev[item.id!] || {
        selected: false,
        addQuantity: 0,
        capitalPrice: item.salesPrice || 0,
        notes: "",
      };
      
      return {
        ...prev,
        [item.id!]: { ...current, [field]: value },
      };
    });
  };

  // Explicitly confirm selection (Check button)
  const confirmSelection = (item: Item) => {
    setBatchData((prev) => {
      const current = prev[item.id!] || {
        selected: false,
        addQuantity: 0,
        capitalPrice: item.salesPrice || 0,
        notes: "",
      };
      
      // Validation: Quantity must be > 0 to select
      if (current.addQuantity <= 0) {
        // Optional: you could return current and show toast/alert in UI instead
        alert("Quantity must be greater than 0 to select this item.");
        return prev;
      }

      return {
        ...prev,
        [item.id!]: { ...current, selected: true },
      };
    });
  };

  // Explicitly cancel selection (X button)
  const cancelSelection = (item: Item) => {
    setBatchData((prev) => {
      // Remove from state or reset to default?
      // Resetting to default (unselected, 0 qty) is safer visually
      const { [item.id!]: _, ...rest } = prev;
      return rest;
    });
  };

  // Get only items that are explicitly selected
  const selectedItems = useMemo(() => {
    return items.filter((item) => batchData[item.id!]?.selected);
  }, [items, batchData]);

  // Totals for review calculation
  const totals = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    
    selectedItems.forEach(item => {
      const data = batchData[item.id!];
      totalQty += data.addQuantity;
      totalCost += data.addQuantity * data.capitalPrice;
    });

    return { totalQty, totalCost, count: selectedItems.length };
  }, [selectedItems, batchData]);

  // Navigation Actions
  const proceedToReview = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to update.");
      return;
    }
    setStep("review");
  };

  const backToSelection = () => {
    setStep("selection");
  };

  // Submit Batch
  const submitBatch = async (onSuccess: () => void) => {
    const payload = selectedItems.map(item => {
      const data = batchData[item.id!];
      return {
        itemId: item.id,
        itemName: item.itemName,
        stockFlow: "stock-in",
        quantity: data.addQuantity,
        capitalPrice: data.capitalPrice,
        notes: data.notes || "Batch Update",
      };
    });

    await addBatchStockEntry(payload, {
      onSuccess: () => {
        setBatchData({});
        setStep("selection");
        onSuccess();
      },
    });
  };

  return {
    batchData,
    step,
    getItemState,
    updateField,
    confirmSelection,
    cancelSelection,
    proceedToReview,
    backToSelection,
    submitBatch,
    selectedItems,
    totals,
    isProcessing,
  };
};
