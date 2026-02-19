// app/inventory/components/item-registration/hooks/useItemTable.ts

import React, { useState, useMemo } from "react";
import { useItems } from "../../../hooks/useItems";
import { useInventoryInfinite } from "../../../../dashboard/hooks/useInventory";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";

export type SortKey = "item_name" | "sales_price" | "unit_cost" | "current_stock";

export interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

export const useItemTable = () => {
  const { removeItem, editItem } = useItems();
  const {
    inventory,
    totalCount,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventoryInfinite();

  const [editingRows, setEditingRows] = useState<Record<string, {
    item_name: string;
    sku: string;
    sales_price: string;
    unit_cost: string;
    description: string;
  }>>({}); 
  const [batchEditMode, setBatchEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "item_name",
    direction: "asc",
  });

  const filteredItems = useMemo(() => {
    let result = [...(inventory || [])];
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.item_name.toLowerCase().includes(lowerQ) ||
          item.sku.toLowerCase().includes(lowerQ) ||
          (item.category && item.category.toLowerCase().includes(lowerQ))
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = (a as any)[sortConfig.key] ?? "";
        const valB = (b as any)[sortConfig.key] ?? "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.toLowerCase().localeCompare(valB.toLowerCase())
            : valB.toLowerCase().localeCompare(valA.toLowerCase());
        }
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      });
    }
    return result;
  }, [inventory, searchQuery, sortConfig]);

  const displayItems = useMemo(() => {
    if (!batchEditMode || Object.keys(editingRows).length === 0) return filteredItems;
    const editing = filteredItems.filter((i) => editingRows[i.item_id]);
    const rest = filteredItems.filter((i) => !editingRows[i.item_id]);
    return [...editing, ...rest];
  }, [filteredItems, editingRows, batchEditMode]);

  const editingCount = Object.keys(editingRows).length;

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.item_id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
      if (batchEditMode && editingRows[id]) {
        handleCancelInlineEdit(id);
      }
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedItems.length} items?`)) {
      selectedItems.forEach((id) => removeItem(id));
      setSelectedItems([]);
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingRows((prev) => ({
      ...prev,
      [item.item_id]: {
        item_name: item.item_name,
        sku: item.sku,
        sales_price: item.sales_price != null ? String(item.sales_price) : "",
        unit_cost: String(item.unit_cost),
        description: item.description || "",
      },
    }));
  };

  const handleCancelInlineEdit = (itemId: string) => {
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[itemId];
      if (Object.keys(next).length === 0) {
        setBatchEditMode(false);
      }
      return next;
    });
  };

  const handleSaveInlineEdit = (item: InventoryItem) => {
    const edits = editingRows[item.item_id];
    if (!edits) return;
    editItem(
      {
        id: item.item_id,
        itemName: edits.item_name,
        sku: edits.sku,
        salesPrice: parseFloat(edits.unit_cost) || 0,
        sellingPrice: parseFloat(edits.sales_price) || 0,
        description: edits.description,
      },
      {
        onSuccess: () => {
          handleCancelInlineEdit(item.item_id);
        },
      }
    );
  };

  const handleEditSelected = () => {
    const newEditing: typeof editingRows = {};
    filteredItems
      .filter((i) => selectedItems.includes(i.item_id))
      .forEach((item) => {
        newEditing[item.item_id] = {
          item_name: item.item_name,
          sku: item.sku,
          sales_price: item.sales_price != null ? String(item.sales_price) : "",
          unit_cost: String(item.unit_cost),
          description: item.description || "",
        };
      });
    setEditingRows((prev) => ({ ...prev, ...newEditing }));
    setBatchEditMode(true);
  };

  const handleUpdateEditingField = (
    itemId: string,
    field: keyof typeof editingRows[string],
    value: string
  ) => {
    setEditingRows((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleDeleteSingle = (item: InventoryItem) => {
    if (item.item_id && window.confirm("Are you sure you want to delete this item?")) {
      removeItem(item.item_id);
    }
  };

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 80 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  return {
    editingRows,
    setEditingRows,
    batchEditMode,
    setBatchEditMode,
    selectedItems,
    setSelectedItems,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    filteredItems,
    displayItems,
    editingCount,
    handleSort,
    toggleSelectAll,
    toggleSelectItem,
    handleDeleteSelected,
    clearSelection,
    handleEdit,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
    handleEditSelected,
    handleUpdateEditingField,
    handleDeleteSingle,
    handleTableScroll,
    isLoading,
    isError,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
  };
};
