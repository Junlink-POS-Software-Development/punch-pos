"use client";

import React, { useState } from "react";
import { X, Edit2, Trash2, Check, FolderPlus, Folder } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData, useCustomerMutations } from "../../hooks/useCustomerData";
import { deleteGroup, renameCustomerGroup } from "@/app/actions/customers";
import { createGroup } from "../../api/services";

/**
 * ─── Manage Groups Modal ────────────────────────────────────────────────────
 * Full-screen modal for creating, renaming, and deleting customer groups.
 */
export function ManageGroupsModal() {
  const { isManageGroupsOpen, setManageGroupsOpen, selectedGroupId, setSelectedGroupId } =
    useCustomerStore();
  const { groups, rawCustomers } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isManageGroupsOpen) return null;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    try {
      await createGroup(newGroupName.trim());
      await refreshData();
      setNewGroupName("");
      setIsCreating(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!editingGroupId || !editingName.trim()) return;
    setLoading(true);
    const result = await renameCustomerGroup(editingGroupId, editingName.trim());
    if (result.success) {
      await refreshData();
      setEditingGroupId(null);
      setEditingName("");
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const hasCustomers = rawCustomers.some((c) => c.group_id === id);
    if (hasCustomers) {
      alert("Cannot delete group. Please remove all customers first.");
      return;
    }
    if (!confirm("Delete this group?")) return;

    setLoading(true);
    const result = await deleteGroup(id);
    if (result.success) {
      await refreshData();
      if (selectedGroupId === id) setSelectedGroupId("all");
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const startEditing = (id: string, name: string) => {
    setEditingGroupId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditingName("");
  };

  const getCustomerCount = (groupId: string) =>
    rawCustomers.filter((c) => c.group_id === groupId).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Manage Groupings</h2>
            <p className="text-muted-foreground text-xs mt-1">
              Create, rename, or delete customer groups.
            </p>
          </div>
          <button
            onClick={() => setManageGroupsOpen(false)}
            className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {/* Add Group Row */}
          {isCreating ? (
            <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-xl border border-border">
              <Folder size={18} className="text-primary shrink-0" />
              <input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateGroup();
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewGroupName("");
                  }
                }}
                placeholder="Group name..."
                className="flex-1 bg-background px-3 py-1.5 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleCreateGroup}
                disabled={loading || !newGroupName.trim()}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? "..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewGroupName("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium"
            >
              <FolderPlus size={18} />
              Add New Group
            </button>
          )}

          {/* Group List */}
          {groups.map((g) => (
            <div
              key={g.id}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 transition-all border border-transparent hover:border-border"
            >
              {editingGroupId === g.id ? (
                /* Editing State */
                <div className="flex items-center gap-2 w-full">
                  <Folder size={18} className="text-primary shrink-0" />
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 bg-background px-3 py-1.5 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={handleRename}
                    disabled={loading}
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                /* Default State */
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder
                      size={18}
                      className={g.is_shared ? "text-amber-500 shrink-0" : "text-primary shrink-0"}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {g.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getCustomerCount(g.id)} customers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(g.id, g.name)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-all"
                      title="Rename"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {groups.length === 0 && !isCreating && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No groups yet. Create one to get started.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={() => setManageGroupsOpen(false)}
            className="w-full py-2.5 bg-accent hover:bg-accent/80 text-foreground rounded-xl text-sm font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
