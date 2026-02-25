// components/CreateGroupModal.tsx
import React, { useState } from "react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { createGroup } from "../../api/services"; // Assuming you have this
import { useCustomerMutations } from "../../hooks/useCustomerData"; // To refresh list

export const CreateGroupModal = () => {
  // 1. Connect directly to the store here
  const { isGroupModalOpen, closeGroupModal } = useCustomerStore();
  const { refreshData } = useCustomerMutations(); 
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. If the store says it's closed, don't render anything
  if (!isGroupModalOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await createGroup(name); // Call API directly here
      await refreshData();     // Refresh the list
      setName("");             // Reset form
      closeGroupModal();       // Close via store
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-2xl border border-border w-96 shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-foreground">Create New Group</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. VIP, Wholesalers..."
          className="w-full bg-background border border-border rounded-xl p-3 mb-6 focus:border-primary outline-none text-foreground"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={closeGroupModal} // Uses store action
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
             className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};