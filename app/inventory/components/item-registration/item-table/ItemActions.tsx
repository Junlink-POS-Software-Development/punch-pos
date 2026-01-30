import React from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import { Item } from "../utils/itemTypes";

interface ItemActionsProps {
  row: Item;
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  // New props for inline editing
  id: string; // for actions
  isEditing?: boolean;
  isSaving?: boolean;
  onStartEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

export const ItemActions: React.FC<ItemActionsProps> = ({
  row,
  data,
  onEdit,
  onDelete,
  isEditing = false,
  isSaving = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}) => {
  const handleAction = (action: (index: number) => void) => {
    // We must find the index in the ORIGINAL data array,
    // because 'row' might be from a filtered list.
    const originalIndex = data.findIndex((i) => i.id === row.id);
    if (originalIndex !== -1) action(originalIndex);
  };

  // Show Save and Cancel buttons when in edit mode
  if (isEditing) {
    return (
      <div className="flex gap-1">
        <button
          onClick={onSaveEdit}
          disabled={isSaving}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            isSaving 
              ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
              : "bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-200"
          }`}
          title="Save Changes"
        >
          {isSaving ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="w-3 h-3" />
              Save
            </>
          )}
        </button>
        <button
          onClick={onCancelEdit}
          disabled={isSaving}
          className="hover:bg-gray-400/20 p-1 rounded text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          title="Cancel Edit"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Normal mode: Show Edit and Delete buttons
  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={onStartEdit}
        className="hover:bg-blue-400/20 p-2 rounded-lg text-blue-300 hover:text-blue-100 transition-all active:scale-90"
        title="Edit Item"
      >
        <Edit className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleAction(onDelete)}
        className="hover:bg-red-400/20 p-2 rounded-lg text-red-400 hover:text-red-200 transition-all active:scale-90"
        title="Delete Item"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};
