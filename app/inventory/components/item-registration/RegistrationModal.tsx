"use client";

import React from "react";
import { X } from "lucide-react";
import { ItemForm } from "./item-form/ItemForm";
import { Item } from "./utils/itemTypes";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: (data: Item) => void;
  itemToEdit?: Item;
  onCancelEdit: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onFormSubmit,
  itemToEdit,
  onCancelEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm animate-in duration-200 fade-in p-4">
      <div className="bg-card shadow-2xl border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-border border-b shrink-0">
          <h2 className="font-semibold text-foreground text-lg">
            {itemToEdit ? "Edit Item" : "Register New Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <ItemForm
            onFormSubmit={onFormSubmit}
            itemToEdit={itemToEdit}
            onCancelEdit={onCancelEdit}
          />
        </div>
      </div>
    </div>
  );
};
