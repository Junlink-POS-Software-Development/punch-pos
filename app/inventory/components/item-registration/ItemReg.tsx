// app/inventory/components/item-registration/ItemReg.tsx

"use client";

import React, { useState } from "react";
import { PackagePlus } from "lucide-react";
import { Item } from "./utils/itemTypes";
import { StatusDisplay } from "@/utils/StatusDisplay";
import { ItemTable } from "./item-table/ItemTable";
import { useItems } from "../../hooks/useItems"; // Import the hook
import { RegistrationModal } from "./RegistrationModal";

const ItemReg = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          { 
            onSuccess: () => {
              setEditingIndex(null);
              setIsModalOpen(false);
            } 
          }
        );
      }
    } else {
      addItem(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
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
          if (editingIndex === index) {
            setEditingIndex(null);
            setIsModalOpen(false);
          }
        },
      });
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const handleOpenRegistration = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  // Handle inline edit save from the table
  const handleSaveInlineEdit = (updatedItem: Item) => {
    if (updatedItem.id) {
      editItem(updatedItem);
    }
  };

  const itemToEdit = editingIndex !== null ? items[editingIndex] : undefined;

  return (
    <div className="space-y-6 p-6 h-[85vh] flex flex-col">
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl text-white">Item Registration</h1>
        <button
          onClick={handleOpenRegistration}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-lg shadow-blue-900/20"
        >
          <PackagePlus className="w-5 h-5" />
          Register New Item
        </button>
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
        <div className="flex-1 bg-slate-900/50 p-6 border border-slate-800 rounded-xl overflow-hidden glass-effect">
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
        <div className="flex flex-col justify-center items-center gap-4 py-20 text-gray-500">
          <p>No items found.</p>
          <button
            onClick={handleOpenRegistration}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Register your first item
          </button>
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFormSubmit={handleFormSubmit}
        itemToEdit={itemToEdit}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default ItemReg;
