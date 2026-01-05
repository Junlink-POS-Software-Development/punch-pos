// app/inventory/components/item-registration/ItemReg.tsx

"use client";

import React, { useState } from "react";
import { ItemForm } from "./item-form/ItemForm";
import { Item } from "./utils/itemTypes";
import { StatusDisplay } from "@/utils/StatusDisplay";
import { ItemTable } from "./item-table/ItemTable";
import { useItems } from "../../hooks/useItems"; // Import the hook

const ItemReg = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Consume the context
  const {
    items,
    isLoading,
    error,
    isProcessing,
    addItem,
    editItem,
    removeItem,
  } = useItems();

  // Handlers
  const handleFormSubmit = (formData: Item) => {
    if (editingIndex !== null) {
      const itemToUpdate = items[editingIndex];
      if (itemToUpdate?.id) {
        editItem(
          { ...formData, id: itemToUpdate.id },
          { onSuccess: () => setEditingIndex(null) } // Close form on success
        );
      }
    } else {
      addItem(formData);
    }
  };

  const handleDelete = (index: number) => {
    const itemToDelete = items[index];
    if (
      itemToDelete?.id &&
      window.confirm("Are you sure you want to delete this item?")
    ) {
      removeItem(itemToDelete.id, {
        onSuccess: () => {
          if (editingIndex === index) setEditingIndex(null);
        },
      });
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);
  const handleCancelEdit = () => setEditingIndex(null);

  // Handle inline edit save from the table
  const handleSaveInlineEdit = (updatedItem: Item) => {
    if (updatedItem.id) {
      editItem(updatedItem);
    }
  };

  const itemToEdit = editingIndex !== null ? items[editingIndex] : undefined;

  return (
    <div className="space-y-8 p-6">
      {/* 🟢 Form Wrapper with glass-effect */}
      <div className="p-4 glass-effect">
        <ItemForm
          onFormSubmit={handleFormSubmit}
          itemToEdit={itemToEdit}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {/* Status Section */}
      {isLoading && <StatusDisplay type="loading" text="Loading items..." />}
      {isProcessing && <StatusDisplay type="processing" text="Processing..." />}
      {error && (
        <StatusDisplay
          type="error"
          text={`Error loading items: ${error.message}`}
        />
      )}

      {/* Table Section */}
      {!isLoading && items.length > 0 && (
        <div className="p-6 glass-effect">
          <ItemTable 
            data={items} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onSaveEdit={handleSaveInlineEdit}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <p className="text-gray-500 text-center">No items found.</p>
      )}
    </div>
  );
};

export default ItemReg;
