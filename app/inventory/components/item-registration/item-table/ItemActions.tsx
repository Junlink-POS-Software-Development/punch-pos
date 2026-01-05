import React from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import { Item } from "../utils/itemTypes";

interface ItemActionsProps {
  row: Item;
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  // New props for inline editing
  isEditing?: boolean;
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
          className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 px-2 py-1 rounded text-green-400 hover:text-green-200 transition-colors text-xs font-medium"
          title="Save Changes"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          onClick={onCancelEdit}
          className="hover:bg-gray-400/20 p-1 rounded text-gray-400 hover:text-gray-200 transition-colors"
          title="Cancel Edit"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Normal mode: Show Edit and Delete buttons
  return (
    <div className="flex gap-2">
      <button
        onClick={onStartEdit}
        className="hover:bg-blue-400/20 p-1 rounded text-blue-300 hover:text-blue-100 transition-colors"
        title="Edit Item"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleAction(onDelete)}
        className="hover:bg-red-400/20 p-1 rounded text-red-400 hover:text-red-200 transition-colors"
        title="Delete Item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
