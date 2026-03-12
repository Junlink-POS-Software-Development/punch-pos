import React from "react";
import { StandardSelect } from "@/components/reusables/StandardSelect";
import { CustomerGroup } from "../../lib/types";

// ─── Bulk Action Bar ────────────────────────────────────────────────────────

interface CustomerBulkActionBarProps {
  selectedCount: number;
  groups: CustomerGroup[];
  onBulkMove: (groupId: string) => void;
}

export function CustomerBulkActionBar({
  selectedCount,
  groups,
  onBulkMove,
}: CustomerBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 p-2 px-4 flex items-center justify-between border-b border-primary/20 animate-in slide-in-from-top-2 duration-200">
      <span className="text-primary text-xs font-bold">{selectedCount} selected</span>
      <StandardSelect
        onChange={(e) => onBulkMove(e.target.value)}
        defaultValue=""
        className="py-1 px-2 h-7 min-w-[100px] text-xs"
        containerClassName="flex-row items-center gap-2 space-y-0"
        label="Move:"
      >
        <option value="" disabled className="bg-background">
          Select Group
        </option>
        <option value="ungrouped" className="bg-background">
          Ungrouped
        </option>
        {groups.map((g) => (
          <option key={g.id} value={g.id} className="bg-background">
            {g.name}
          </option>
        ))}
      </StandardSelect>
    </div>
  );
}
