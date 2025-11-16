import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Item } from "../utils/itemTypes";

interface ItemActionsProps {
  row: Item;
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ItemActions: React.FC<ItemActionsProps> = ({
  row,
  data,
  onEdit,
  onDelete,
}) => {
  const handleAction = (action: (index: number) => void) => {
    // We must find the index in the ORIGINAL data array,
    // because 'row' might be from a filtered list.
    const originalIndex = data.findIndex((i) => i.id === row.id);
    if (originalIndex !== -1) action(originalIndex);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction(onEdit)}
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
