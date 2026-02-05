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
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-96 shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-white">Create New Group</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. VIP, Wholesalers..."
          className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 mb-6 focus:border-blue-500 outline-none text-white"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={closeGroupModal} // Uses store action
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};