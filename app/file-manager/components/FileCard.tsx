"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileItem,
  FolderItem,
} from "../types";
import { formatFileSize } from "../utils/compression";
import {
  MoreVertical,
  Eye,
  FolderInput,
  Download,
  Trash2,
  Check,
  GripVertical,
  RotateCw,
} from "lucide-react";

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onToggleSelect: (fileId: string) => void;
  onPreview: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onMoveToFolder: (file: FileItem, targetFolder: string) => void;
  availableFolders: FolderItem[];
  onDragStart: (e: React.DragEvent, file: FileItem) => void;
  onRotate?: (file: FileItem, degrees: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onToggleSelect,
  onPreview,
  onDelete,
  onMoveToFolder,
  availableFolders,
  onDragStart,
  onRotate,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  // Clean filename for display by stripping timestamp prefix if present
  const displayFileName = React.useMemo(() => {
    const parts = file.name.split("_");
    if (parts.length > 1 && !isNaN(Number(parts[0]))) {
      return parts.slice(1).join("_");
    }
    return file.name;
  }, [file.name]);

  const otherFolders = availableFolders.filter((f) => f.name !== file.folder);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.url;
    link.download = displayFileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, file)}
      onClick={() => onPreview(file)}
      className={`
        group relative flex flex-col rounded-xl border bg-card p-2.5 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md
        ${
          isSelected
            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
            : "border-border hover:border-primary/50"
        }
      `}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/60 flex items-center justify-center">
        {/* Drag handle pill */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-md p-1 text-white shadow-sm pointer-events-none">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Selection Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          className={`
            absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border transition-all shadow-sm
            ${
              isSelected
                ? "border-primary bg-primary text-white opacity-100 scale-105"
                : "border-border bg-background/80 text-transparent opacity-0 group-hover:opacity-100 hover:border-primary backdrop-blur-sm"
            }
          `}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Thumbnail Image */}
        <img
          src={file.url}
          alt={displayFileName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`
            h-full w-full object-cover transition-transform duration-300 group-hover:scale-105
            ${imageLoaded ? "opacity-100" : "opacity-0"}
          `}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            <span className="text-[10px] text-muted-foreground font-mono">LOADING</span>
          </div>
        )}

        {/* Size Badge Overlay */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm pointer-events-none">
          {formatFileSize(file.size)}
        </div>
      </div>

      {/* Info & Footer */}
      <div className="mt-2.5 flex items-center justify-between gap-1.5 px-0.5">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-semibold text-foreground"
            title={displayFileName}
          >
            {displayFileName}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(file.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Quick Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
              setShowMoveSubmenu(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Dropdown */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setShowMoveSubmenu(false);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1 z-40 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onPreview(file);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Preview Full</span>
                </button>

                {onRotate && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRotate(file, 90);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Rotate 90° CW</span>
                  </button>
                )}

                {otherFolders.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMoveSubmenu(!showMoveSubmenu)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FolderInput className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Move to...</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">›</span>
                    </button>

                    {showMoveSubmenu && (
                      <div className="absolute left-full bottom-0 ml-1 w-40 rounded-xl border border-border bg-popover p-1 shadow-xl">
                        {otherFolders.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              setShowMoveSubmenu(false);
                              onMoveToFolder(file, f.name);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left truncate"
                          >
                            <span className="truncate">{f.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Download</span>
                </button>

                <div className="my-1 border-t border-border/50" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(file);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
