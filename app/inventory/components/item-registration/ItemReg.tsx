// ItemReg.tsx

"use client";

import React, { useState } from "react";
import { ItemForm } from "./ItemForm";
import { ItemTable } from "./ItemTable";
import { Item } from "./utils/itemTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// --- 1. Import the new API functions ---
import { fetchItems, insertItem, updateItem, deleteItem } from "./lib/item.api";
// ---
// vvv 1. IMPORT YOUR NEW STATUS COMPONENT vvv
// ---
import { StatusDisplay } from "@/utils/StatusDisplay"; // Adjust path if needed
// ---

// ... (Rest of the imports and component start) ...

const ItemReg = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // ... (checkUser useEffect) ...
  React.useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: member } = await supabase
          .from("members")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (!member) {
          console.error(
            "Auth Warning: This user is not in the 'members' table. RLS policies may block inserts/updates."
          );
        }
      }
    };
    checkUser();
  }, []);

  // ... (useQuery hook) ...
  const {
    data: items,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  // ... (Mutations and handlers remain the same) ...
  const handleMutationError = (error: Error, operation: string) => {
    console.error(`${operation} mutation error:`, error);
    alert(`${operation} failed: ${error.message}`);
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const createItemMutation = useMutation({
    mutationFn: insertItem,
    onSuccess: handleMutationSuccess,
    onError: (error) => handleMutationError(error, "Create"),
  });

  const updateItemMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: () => {
      handleMutationSuccess();
      setEditingIndex(null);
    },
    onError: (error) => handleMutationError(error, "Update"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      handleMutationSuccess();
      if (editingIndex !== null) {
        setEditingIndex(null);
      }
    },
    onError: (error) => handleMutationError(error, "Delete"),
  });

  const handleFormSubmit = (formData: Item) => {
    if (editingIndex !== null) {
      const itemToUpdate = items?.[editingIndex];
      if (itemToUpdate && itemToUpdate.id) {
        updateItemMutation.mutate({ ...formData, id: itemToUpdate.id });
      }
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const itemToDelete = items?.[index];
    if (
      itemToDelete?.id &&
      window.confirm("Are you sure you want to delete this item?")
    ) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const itemToEdit = editingIndex !== null ? items?.[editingIndex] : undefined;

  const isProcessing =
    createItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteItemMutation.isPending;

  return (
    <div className="space-y-8 p-6">
      {/* 🟢 Form Wrapper with glass-effect */}
      <div className="p-6 glass-effect">
        <ItemForm
          onFormSubmit={handleFormSubmit}
          itemToEdit={itemToEdit}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {/* --- Status Displays --- */}
      {isLoadingItems && (
        <StatusDisplay type="loading" text="Loading items..." />
      )}
      {isProcessing && <StatusDisplay type="processing" text="Processing..." />}
      {itemsError && (
        <StatusDisplay
          type="error"
          text={`Error loading items: ${itemsError.message}`}
        />
      )}
      {/* --- */}

      {/* 🟢 Table Wrapper with glass-effect */}
      {!isLoadingItems && items && items.length > 0 && (
        <div className="p-6 glass-effect">
          <ItemTable data={items} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}

      {/* Empty State */}
      {!isLoadingItems && (!items || items.length === 0) && (
        <p className="text-gray-500 text-center">No items found.</p>
      )}
    </div>
  );
};

export default ItemReg;
