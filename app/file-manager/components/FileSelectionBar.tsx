"use client";

import React, { useState } from "react";
import { FolderItem } from "../types";
import {
  FolderInput,
  Trash2,
  X,
  CheckSquare,
  ChevronDown,
} from "lucide-react";

interface FileSelectionBarProps {
  selectedCount: number;
  availableFolders: FolderItem[];
  currentFolder: string;
  onClearSelection: () => void;
  onMoveSelected: (targetFolder: string) => void;
  onDeleteSelected: () => void;
  isProcessing?: boolean;
}

export const FileSelectionBar: React.FC<FileSelectionBarProps> = ({
  selectedCount,
  availableFolders,
  currentFolder,
  onClearSelection,
  onMoveSelected,
  onDeleteSelected,
  isProcessing = false,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (selectedCount === 0) return null;

  const targetFolders = availableFolders.filter((f) => f.name !== currentFolder);

  return (
    <div className="sticky bottom-4 z-30 mx-auto mt-4 flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-background/95 p-3 px-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-foreground">
          {selectedCount === 1 ? "image selected" : "images selected"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Move To Dropdown */}
        {targetFolders.length > 0 && (
          <div className="relative">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Move to Folder</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showMoveMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoveMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 z-50 w-48 rounded-xl border border-border bg-popover p-1 shadow-2xl">
                  <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Select Target Folder
                  </div>
                  {targetFolders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => {
                        setShowMoveMenu(false);
                        onMoveSelected(folder.name);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                    >
                      <span className="truncate">{folder.displayName}</span>
                      {folder.isPublic && (
                        <span className="ml-auto text-[9px] text-muted-foreground rounded bg-muted px-1">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delete Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onDeleteSelected}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="flex h-7 w-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
