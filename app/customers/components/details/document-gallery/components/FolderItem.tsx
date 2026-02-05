"use client";

import React from "react";
import { Folder, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { FolderType } from "../types";

interface FolderItemProps {
  folder: FolderType;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDrop: (e: React.DragEvent) => void;
  draggedFile: string | null;
  children: React.ReactNode;
}

export const FolderItem = ({
  folder,
  isExpanded,
  onToggle,
  onDelete,
  onDrop,
  draggedFile,
  children
}: FolderItemProps) => {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`border border-gray-700 rounded-xl overflow-hidden transition-colors ${
        draggedFile ? "border-dashed border-blue-500/50 bg-blue-500/5" : "bg-gray-900/30"
      }`}
    >
      <div
        className="flex justify-between items-center hover:bg-gray-800/50 p-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )}
          <Folder size={16} className="text-blue-400" />
          <span className="font-medium text-gray-200 text-sm">
            {folder.name}
          </span>
          <span className="text-gray-600 text-xs">
            ({folder.filePaths.length})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:bg-red-500/20 p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
          title="Delete Folder"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isExpanded && (
        <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 p-3 pt-0">
          {children}
        </div>
      )}
    </div>
  );
};
