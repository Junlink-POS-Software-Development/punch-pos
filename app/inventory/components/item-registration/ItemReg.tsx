// app/inventory/components/item-registration/ItemReg.tsx

"use client";

import React, { useState } from "react";
import { PackagePlus } from "lucide-react";
import { Item } from "./utils/itemTypes";
import { StatusDisplay } from "@/utils/StatusDisplay";
import { ItemTable } from "./item-table/ItemTable";
import { useItems, useInfiniteItems } from "../../hooks/useItems"; // Import the hook
import { RegistrationModal } from "./RegistrationModal";

const ItemReg = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Consume the context
  const {
    items: allItems,
    isLoading: isInitialLoading,
    error,
    isProcessing,
    addItem,
    editItem,
    removeItem,
  } = useItems();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useInfiniteItems(50);

  const items = infiniteData?.pages.flatMap((page: any) => page.data) || [];
  const totalItems = infiniteData?.pages[0]?.count || 0;
  const isLoading = isInitialLoading || isInfiniteLoading;

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

  // Handle save inline edit save from the table
  const handleSaveInlineEdit = async (updatedItem: Item) => {
    if (updatedItem.id) {
      return await editItem(updatedItem);
    }
  };

  const itemToEdit = editingIndex !== null ? items[editingIndex] : undefined;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] px-6 pb-6 pt-2 space-y-4">
      {/* Header & Actions - MOVED TO TABLE OR GLOBAL IF NEEDED */}
      {/* 
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl text-foreground">Item Registration</h1>
        ...
      </div> 
      */}

      {/* Status Section */}
      {isLoading && items.length === 0 && <StatusDisplay type="loading" text="Loading items..." />}
      {isProcessing && <StatusDisplay type="processing" text="Processing..." />}
      {error && (
        <StatusDisplay
          type="error"
          text={`Error loading items: ${error.message}`}
        />
      )}

      {/* Table Section */}
      {(items.length > 0) && (
        <div className="flex-1 bg-card p-6 border border-border rounded-xl overflow-hidden shadow-sm">
          <ItemTable 
            data={items} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onSaveEdit={handleSaveInlineEdit}
            onAdd={handleOpenRegistration}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage || false}
            isFetchingNextPage={isFetchingNextPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col justify-center items-center gap-4 py-20 text-muted-foreground">
          <p>No items found.</p>
          <button
            onClick={handleOpenRegistration}
            className="text-primary hover:text-primary/80 underline"
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
