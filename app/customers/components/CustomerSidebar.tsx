import React, { useState } from "react";
import { Folder, FolderPlus, Layers, Trash2, Users, Edit2, Check, X, ChevronLeft } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import {
  useCustomerData,
  useCustomerMutations,
} from "../hooks/useCustomerData";
import { deleteGroup, renameCustomerGroup } from "../api/services";

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CustomerSidebar = ({ isOpen = true, onClose }: CustomerSidebarProps) => {
  const { groups, customers } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  const { selectedGroupId, setSelectedGroupId, openGroupModal } =
    useCustomerStore();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleDelete = async (id: string) => {
    // Check if group has customers
    const hasCustomers = customers.some((c) => c.group_id === id);
    if (hasCustomers) {
      alert("Cannot delete group. Please remove all customers from this group first.");
      return;
    }

    if (!confirm("Delete group?")) return;
    await deleteGroup(id);
    refreshData();
    if (selectedGroupId === id) setSelectedGroupId("all");
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingGroupId(id);
    setEditingName(currentName);
  };

  const saveEdit = async () => {
    if (!editingGroupId || !editingName.trim()) return;
    await renameCustomerGroup(editingGroupId, editingName.trim());
    refreshData();
    setEditingGroupId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditingName("");
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-5 border-gray-700 border-b shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-100 text-lg">Groups</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={openGroupModal}
              className="bg-blue-600/20 hover:bg-blue-600 p-2 rounded-lg text-blue-400 hover:text-white transition"
            >
              <FolderPlus size={18} />
            </button>
            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden bg-gray-700/50 hover:bg-gray-700 p-2 rounded-lg text-gray-400 hover:text-white transition"
                aria-label="Close sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 p-3 overflow-y-auto custom-scrollbar">
        {/* Static Filters */}
        <button
          onClick={() => setSelectedGroupId("all")}
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
            selectedGroupId === "all"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Layers size={18} /> <span className="font-medium">Grouped</span>
        </button>
        <button
          onClick={() => setSelectedGroupId("ungrouped")}
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
            selectedGroupId === "ungrouped"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Users size={18} /> <span className="font-medium">Ungrouped</span>
        </button>

        <div className="mx-2 my-4 border-gray-700 border-t"></div>

        {/* Dynamic Groups */}
        {groups.map((g) => (
          <div key={g.id} className="group relative flex items-center mb-1">
            {editingGroupId === g.id ? (
              <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg w-full">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="bg-gray-900 px-2 py-1 border border-blue-500 rounded w-full text-sm text-white focus:outline-none"
                />
                <button onClick={saveEdit} className="text-green-400 hover:text-green-300">
                  <Check size={16} />
                </button>
                <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                    selectedGroupId === g.id
                      ? "bg-gray-700 text-white border-l-4 border-blue-500"
                      : "text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  <Folder
                    size={18}
                    className={g.is_shared ? "text-yellow-500" : "text-emerald-500"}
                  />
                  <span className="flex-1 truncate">{g.name}</span>
                </button>
                <div className="right-2 absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(g.id, g.name);
                    }}
                    className="hover:bg-gray-600 p-1 rounded text-gray-500 hover:text-blue-400 transition"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(g.id);
                    }}
                    className="hover:bg-gray-600 p-1 rounded text-gray-500 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
