"use client";

import React, { useState, useMemo } from "react";
import { FileItem, FolderItem } from "../types";
import { FileCard } from "./FileCard";
import { FileSelectionBar } from "./FileSelectionBar";
import { formatFileSize } from "../utils/compression";
import {
  Upload,
  Search,
  Grid,
  List as ListIcon,
  CheckSquare,
  Square,
  RefreshCw,
  RotateCw,
  FolderOpen,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface FileListProps {
  currentFolder: FolderItem | undefined;
  currentFolderName: string;
  files: FileItem[];
  isLoading: boolean;
  isFetching?: boolean;
  onRefresh: () => void;
  onUploadClick: () => void;
  onDropFromDesktop: (files: FileList) => void;
  onBackToPublicClick: () => void;
  availableFolders: FolderItem[];
  onMoveFile: (file: FileItem, targetFolder: string) => void;
  onMoveMultiple: (fileNames: string[], targetFolder: string) => void;
  onDeleteFile: (file: FileItem) => void;
  onDeleteMultiple: (fileNames: string[]) => void;
  onPreviewFile: (file: FileItem) => void;
  onDragStart: (e: React.DragEvent, file: FileItem) => void;
  onRotateFile?: (file: FileItem, degrees: number) => void;
}

export const FileList: React.FC<FileListProps> = ({
  currentFolder,
  currentFolderName,
  files,
  isLoading,
  isFetching = false,
  onRefresh,
  onUploadClick,
  onDropFromDesktop,
  onBackToPublicClick,
  availableFolders,
  onMoveFile,
  onMoveMultiple,
  onDeleteFile,
  onDeleteMultiple,
  onPreviewFile,
  onDragStart,
  onRotateFile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDesktopDragging, setIsDesktopDragging] = useState(false);

  const isPublic = currentFolderName === "public";

  // Filter files by search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const allSelected =
    filteredFiles.length > 0 && selectedIds.size === filteredFiles.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Handle desktop drop to upload
  const handleDesktopDragOver = (e: React.DragEvent) => {
    // Only accept files from desktop (dataTransfer has Files type)
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDesktopDragging(true);
    }
  };

  const handleDesktopDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDesktopDragging(false);
  };

  const handleDesktopDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDesktopDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFromDesktop(e.dataTransfer.files);
    }
  };

  // Multi-move handler
  const handleBulkMove = (targetFolder: string) => {
    const selectedFiles = files.filter((f) => selectedIds.has(f.id));
    const names = selectedFiles.map((f) => f.name);
    onMoveMultiple(names, targetFolder);
    clearSelection();
  };

  // Multi-delete handler
  const handleBulkDelete = () => {
    const selectedFiles = files.filter((f) => selectedIds.has(f.id));
    const names = selectedFiles.map((f) => f.name);
    if (
      confirm(
        `Are you sure you want to delete ${names.length} selected ${
          names.length === 1 ? "image" : "images"
        }?`
      )
    ) {
      onDeleteMultiple(names);
      clearSelection();
    }
  };

  return (
    <div
      onDragOver={handleDesktopDragOver}
      onDragLeave={handleDesktopDragLeave}
      onDrop={handleDesktopDrop}
      className="relative flex h-full flex-col overflow-hidden bg-background p-5"
    >
      {/* Overlay when dragging files from computer */}
      {isDesktopDragging && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/90 backdrop-blur-md text-white border-4 border-dashed border-white rounded-2xl p-6 m-3 pointer-events-none animate-in fade-in duration-150">
          <Upload className="w-12 h-12 mb-3 animate-bounce" />
          <h3 className="text-xl font-bold">Drop images to upload directly!</h3>
          <p className="text-sm opacity-90">
            Files will be automatically compressed to WebP and added to {currentFolderName}
          </p>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {!isPublic && (
            <button
              type="button"
              onClick={onBackToPublicClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              title="Back to Public (Unsorted)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">
                {currentFolder?.displayName || currentFolderName}
              </h2>
              {isPublic && (
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Unsorted Pool
                </span>
              )}
              {isFetching && !isLoading && (
                <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground animate-pulse font-medium">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-primary" />
                  <span className="hidden sm:inline">Syncing...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "image" : "images"} in this folder
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Select All, Layout Toggle, Upload */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images..."
              className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Select all button */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              allSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Select all filtered images"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Select All</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Refresh files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Grid / List toggle */}
          <div className="flex items-center rounded-xl border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={onUploadClick}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Main Files Display */}
      <div className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
        {isLoading && files.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl border border-border/60 bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4">
              <ImageIcon className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {searchQuery ? "No matching images found" : "No images in this folder yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {searchQuery
                ? `No images matched "${searchQuery}". Try clearing the search.`
                : isPublic
                ? "Upload unsorted photos here, then drag and drop them to your user folders on the left."
                : "This folder is currently empty. Drag images from the public folder or upload new ones."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={onUploadClick}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to {currentFolderName}</span>
              </button>
              {!isPublic && (
                <button
                  type="button"
                  onClick={onBackToPublicClick}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  View Public Unsorted
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pb-16">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedIds.has(file.id)}
                onToggleSelect={toggleSelectOne}
                onPreview={onPreviewFile}
                onDelete={onDeleteFile}
                onMoveToFolder={onMoveFile}
                availableFolders={availableFolders}
                onDragStart={onDragStart}
                onRotate={onRotateFile}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2 pb-16">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => onDragStart(e, file)}
                onClick={() => onPreviewFile(file)}
                className={`
                  group flex items-center justify-between rounded-xl border p-2.5 cursor-grab active:cursor-grabbing transition-all
                  ${
                    selectedIds.has(file.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(file.id);
                    }}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      selectedIds.has(file.id)
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    {selectedIds.has(file.id) && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>

                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onRotateFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotateFile(file, 90);
                      }}
                      title="Rotate 90° CW"
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewFile(file);
                    }}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Multi-Selection Action Bar */}
      <FileSelectionBar
        selectedCount={selectedIds.size}
        availableFolders={availableFolders}
        currentFolder={currentFolderName}
        onClearSelection={clearSelection}
        onMoveSelected={handleBulkMove}
        onDeleteSelected={handleBulkDelete}
      />
    </div>
  );
};
