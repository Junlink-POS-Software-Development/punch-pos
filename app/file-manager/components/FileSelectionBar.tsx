"use client";

import React, { useState } from "react";
import { FolderItem } from "../types";
import {
  FolderInput,
  Folder,
  Trash2,
  X,
  CheckSquare,
  ChevronDown,
  Search,
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
  const [folderSearch, setFolderSearch] = useState("");

  if (selectedCount === 0) return null;

  const targetFolders = availableFolders.filter((f) => f.name !== currentFolder);
  const filteredFolders = targetFolders.filter((f) =>
    f.displayName.toLowerCase().includes(folderSearch.toLowerCase().trim())
  );

  const handleCloseMenu = () => {
    setShowMoveMenu(false);
    setFolderSearch("");
  };

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
              onClick={() => {
                if (showMoveMenu) {
                  handleCloseMenu();
                } else {
                  setShowMoveMenu(true);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Move to Folder</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showMoveMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={handleCloseMenu}
                />
                <div className="absolute right-0 bottom-full mb-2 z-50 w-60 sm:w-64 rounded-xl border border-border bg-card dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase border-b border-border/60 bg-muted/40 flex items-center justify-between shrink-0">
                    <span>Move to Folder</span>
                    <span className="text-[9px] font-normal lowercase text-muted-foreground">
                      {targetFolders.length} {targetFolders.length === 1 ? "folder" : "folders"}
                    </span>
                  </div>

                  {targetFolders.length > 4 && (
                    <div className="p-2 border-b border-border/50 shrink-0 bg-background/50">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search folder..."
                          value={folderSearch}
                          onChange={(e) => setFolderSearch(e.target.value)}
                          className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
                    {filteredFolders.length > 0 ? (
                      filteredFolders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => {
                            handleCloseMenu();
                            onMoveSelected(folder.name);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
                        >
                          <Folder className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                          <span className="truncate flex-1 font-medium">{folder.displayName}</span>
                          {folder.isPublic && (
                            <span className="text-[9px] text-muted-foreground group-hover:text-primary font-semibold rounded bg-muted group-hover:bg-primary/15 px-1.5 py-0.5 shrink-0 transition-colors">
                              Default
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No matching folders
                      </div>
                    )}
                  </div>
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
