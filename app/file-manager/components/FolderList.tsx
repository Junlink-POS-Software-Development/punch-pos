"use client";

import React, { useState } from "react";
import { FolderItem } from "../types";
import {
  Folder,
  FolderPlus,
  FolderOpen,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Inbox,
} from "lucide-react";

interface FolderListProps {
  folders: FolderItem[];
  activeFolder: string;
  onSelectFolder: (folderName: string) => void;
  onCreateFolderClick: () => void;
  onRenameFolderClick: (folder: FolderItem) => void;
  onDeleteFolderClick: (folder: FolderItem) => void;
  onDropOnFileFolder: (targetFolder: string) => void;
  draggedFileName: string | null;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  activeFolder,
  onSelectFolder,
  onCreateFolderClick,
  onRenameFolderClick,
  onDeleteFolderClick,
  onDropOnFileFolder,
  draggedFileName,
}) => {
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [menuOpenFolderId, setMenuOpenFolderId] = useState<string | null>(null);

  const publicFolder = folders.find((f) => f.isPublic);
  const userFolders = folders.filter((f) => !f.isPublic);

  const handleDragOver = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolder !== folderName) {
      setDragOverFolder(folderName);
    }
  };

  const handleDragLeave = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    if (dragOverFolder === folderName) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    onDropOnFileFolder(folderName);
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card/60 p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Folders</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {folders.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onCreateFolderClick}
          className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors active:scale-95 shadow-sm"
          title="Create a new folder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Drag & Drop Hint Banner when dragging */}
      {draggedFileName && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-xs text-primary animate-pulse">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="truncate">Drop on any folder below to move file</span>
        </div>
      )}

      {/* Folder Items Container */}
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {/* Default Public Folder */}
        {publicFolder && (
          <div
            onDragOver={(e) => handleDragOver(e, publicFolder.name)}
            onDragLeave={(e) => handleDragLeave(e, publicFolder.name)}
            onDrop={(e) => handleDrop(e, publicFolder.name)}
            onClick={() => onSelectFolder(publicFolder.name)}
            className={`
              group relative flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200
              ${
                dragOverFolder === publicFolder.name
                  ? "border-primary bg-primary/15 ring-2 ring-primary scale-[1.02] shadow-lg"
                  : activeFolder === publicFolder.name
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground"
              }
            `}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0 ${
                  activeFolder === publicFolder.name
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Inbox className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-bold text-foreground">
                    public
                  </span>
                  <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-semibold text-primary">
                    Default
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Unsorted images</p>
              </div>
            </div>

            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {publicFolder.fileCount}
            </span>
          </div>
        )}

        <div className="pt-2">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-1">
            User Folders
          </span>
        </div>

        {/* User Created Folders List */}
        {userFolders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center">
            <Folder className="mx-auto w-7 h-7 text-muted-foreground/60 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              No custom folders yet
            </p>
            <button
              type="button"
              onClick={onCreateFolderClick}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              + Create your first folder
            </button>
          </div>
        ) : (
          userFolders.map((folder) => {
            const isActive = activeFolder === folder.name;
            const isDragTarget = dragOverFolder === folder.name;

            return (
              <div
                key={folder.id}
                onDragOver={(e) => handleDragOver(e, folder.name)}
                onDragLeave={(e) => handleDragLeave(e, folder.name)}
                onDrop={(e) => handleDrop(e, folder.name)}
                onClick={() => onSelectFolder(folder.name)}
                className={`
                  group relative flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all duration-200
                  ${
                    isDragTarget
                      ? "border-primary bg-primary/20 ring-2 ring-primary scale-[1.02] shadow-lg"
                      : isActive
                      ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/40 text-foreground"
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {isActive ? (
                      <FolderOpen className="w-4 h-4" />
                    ) : (
                      <Folder className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className="truncate text-xs font-semibold text-foreground"
                    title={folder.displayName}
                  >
                    {folder.displayName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {folder.fileCount}
                  </span>

                  {/* Options Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenFolderId(
                          menuOpenFolderId === folder.id ? null : folder.id
                        );
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpenFolderId === folder.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenFolderId(null);
                          }}
                        />
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 z-40 w-36 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpenFolderId(null);
                              onRenameFolderClick(folder);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpenFolderId(null);
                              onDeleteFolderClick(folder);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors text-left"
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
          })
        )}
      </div>
    </div>
  );
};
