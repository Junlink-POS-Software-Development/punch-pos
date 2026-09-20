// app/inventory/components/item-registration/hooks/useItemTable.ts

import React, { useMemo } from "react";
import { useItems } from "../../../hooks/useItems";
import { useInventoryInfinite } from "../../../../dashboard/hooks/useInventory";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";
import { useItemRegStore } from "../store/useItemRegStore";

import {
  extractPharmacyMeta,
  stripPharmacyMetaFromDescription,
  embedPharmacyMetaInDescription,
} from "@/lib/utils/pharmacyMeta";

export type { SortKey, SortConfig } from "../store/useItemRegStore";

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

  // Use Zustand store for table state
  const {
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
    toggleSelectItem,
  } = useItemRegStore();

  const filteredItems = useMemo(() => {
    // Deduplicate to prevent key collision errors if data shifts during fetch
    const uniqueMap = new Map();
    (inventory || []).forEach((item) => {
      uniqueMap.set(item.item_id, item);
    });
    let result = Array.from(uniqueMap.values());

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.item_name.toLowerCase().includes(lowerQ) ||
          item.sku.toLowerCase().includes(lowerQ) ||
          (item.category && item.category.toLowerCase().includes(lowerQ)) ||
          (item.generic_name && item.generic_name.toLowerCase().includes(lowerQ)) ||
          (item.dosage && item.dosage.toLowerCase().includes(lowerQ)) ||
          (item.description && item.description.toLowerCase().includes(lowerQ))
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = (a as any)[sortConfig.key];
        let valB = (b as any)[sortConfig.key];
        if (!valA && (sortConfig.key === "generic_name" || sortConfig.key === "dosage")) {
          const metaA = extractPharmacyMeta(a);
          valA = sortConfig.key === "generic_name" ? metaA.genericName : metaA.dosage;
        }
        if (!valB && (sortConfig.key === "generic_name" || sortConfig.key === "dosage")) {
          const metaB = extractPharmacyMeta(b);
          valB = sortConfig.key === "generic_name" ? metaB.genericName : metaB.dosage;
        }
        valA = valA ?? "";
        valB = valB ?? "";
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

  const handleSort = (key: any) => {
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

  const handleSelectItem = (id: string) => {
    const isSelected = selectedItems.includes(id);
    toggleSelectItem(id);
    
    if (isSelected && batchEditMode && editingRows[id]) {
      handleCancelInlineEdit(id);
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
    const meta = extractPharmacyMeta(item);
    setEditingRows((prev) => ({
      ...prev,
      [item.item_id]: {
        item_name: item.item_name,
        sku: item.sku,
        sales_price: item.sales_price != null ? String(item.sales_price) : "",
        description: stripPharmacyMetaFromDescription(item.description) || "",
        image_url: item.image_url || null,
        generic_name: item.generic_name || meta.genericName || "",
        dosage: item.dosage || meta.dosage || "",
        brand_type: item.brand_type || meta.brandType || "branded",
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
    handleCancelInlineEdit(item.item_id);

    const cleanDesc = stripPharmacyMetaFromDescription(edits.description || "");
    const finalDescription = (edits.generic_name || edits.brand_type || edits.dosage)
      ? embedPharmacyMetaInDescription(cleanDesc, {
          genericName: edits.generic_name,
          dosage: edits.dosage,
          brandType: edits.brand_type,
        })
      : cleanDesc;

    editItem(
      {
        id: item.item_id,
        itemName: edits.item_name,
        sku: edits.sku,
        salesPrice: 0,
        sellingPrice: parseFloat(edits.sales_price) || 0,
        description: finalDescription,
        imageUrl: edits.image_url,
        genericName: edits.generic_name || undefined,
        dosage: edits.dosage || undefined,
        brandType: edits.brand_type,
      }
    );
  };

  const handleEditSelected = () => {
    const newEditing: any = {};
    filteredItems
      .filter((i) => selectedItems.includes(i.item_id))
      .forEach((item) => {
        const meta = extractPharmacyMeta(item);
        newEditing[item.item_id] = {
          item_name: item.item_name,
          sku: item.sku,
          sales_price: item.sales_price != null ? String(item.sales_price) : "",
          description: stripPharmacyMetaFromDescription(item.description) || "",
          image_url: item.image_url || null,
          generic_name: item.generic_name || meta.genericName || "",
          dosage: item.dosage || meta.dosage || "",
          brand_type: item.brand_type || meta.brandType || "branded",
        };
      });
    setEditingRows((prev) => ({ ...prev, ...newEditing }));
    setBatchEditMode(true);
  };

  const handleUpdateEditingField = (
    itemId: string,
    field: string,
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
    batchEditMode,
    selectedItems,
    searchQuery,
    setSearchQuery,
    sortConfig,
    filteredItems,
    displayItems,
    editingCount,
    handleSort,
    toggleSelectAll,
    toggleSelectItem: handleSelectItem,
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

