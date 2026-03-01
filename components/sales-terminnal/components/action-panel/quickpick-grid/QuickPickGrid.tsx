import React, { useState } from "react";
import { useQuickPickItems, QuickPickItem } from "./hooks/useQuickPickItems";
import { QuickPickEditor } from "./QuickPickEditor";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";

interface QuickPickGridProps {
  onSelect: (item: Item) => void;
}

export const QuickPickGrid = ({ onSelect }: QuickPickGridProps) => {
  const { quickPickItems, isLoading, saveQuickPickItems } = useQuickPickItems();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSave = async (items: Omit<QuickPickItem, 'id'>[]) => {
    await saveQuickPickItems(items);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs text-muted-foreground font-bold">Quick Pick</label>
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          Edit
        </button>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Loading...
          </div>
        ) : quickPickItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <span className="text-xs">No items set</span>
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-1 bg-muted rounded text-xs hover:bg-muted/80 text-foreground"
            >
              Add Items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
            {quickPickItems.map((btn) => (
              <button
                type="button"
                key={btn.id}
                onClick={() => btn.item && onSelect(btn.item)}
                className={`
                  ${btn.color.split('|')[0]} border shadow-lg backdrop-blur-sm
                  rounded-lg p-1 text-[10px] font-bold leading-tight h-12 sm:h-16
                  hover:brightness-110 active:scale-95 transition-all
                  flex items-center justify-center text-center wrap-break-word
                  relative overflow-hidden
                `}
              >
                <span className="relative z-10 drop-shadow-md">{btn.label}</span>
                {/* Optional: Add image background if image_url exists */}
                {btn.image_url && (
                  <div 
                    className={`absolute inset-0 ${btn.color.split('|')[1] || 'bg-cover'} bg-center opacity-30`}
                    style={{ backgroundImage: `url(${btn.image_url})` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <QuickPickEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentItems={quickPickItems}
        onSave={handleSave}
      />
    </div>
  );
};
