"use client";

import React, { useState } from "react";
import { FolderItem, FileItem } from "../types";
import { useFileManagerData } from "../hooks/useFileManagerData";
import { FolderList } from "./FolderList";
import { FileList } from "./FileList";
import { UploadModal } from "./UploadModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { compressImageToWebP } from "../utils/compression";
import { uploadFiles } from "@/app/actions/fileManager";
import {
  FolderArchive,
  HardDrive,
  Sparkles,
  Files,
  Loader2,
} from "lucide-react";

export const FileManagerView: React.FC = () => {
  // TanStack Query cached data & optimistic mutations
  const {
    folders,
    isLoadingFolders,
    isFetchingFolders,
    files,
    isLoadingFiles,
    isFetchingFiles,
    stats,
    activeFolderName,
    setActiveFolderName,
    refreshAll,
    moveFileOptimistic,
    moveMultipleOptimistic,
    deleteFileOptimistic,
    deleteMultipleOptimistic,
    createFolderOptimistic,
    renameFolderOptimistic,
    deleteFolderOptimistic,
    handleUploadCompleted,
    rotateImageOptimistic,
  } = useFileManagerData();

  // Drag and drop state
  const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<FolderItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const activeFolderItem = folders.find((f) => f.name === activeFolderName);

  // Drag start handler on a file card
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    setDraggedFile(file);
    e.dataTransfer.setData("text/plain", file.name);
    e.dataTransfer.effectAllowed = "move";
  };

  // Drop on a folder in the left pane
  const handleDropOnFolder = async (targetFolder: string) => {
    if (!draggedFile) return;
    if (draggedFile.folder === targetFolder) {
      setDraggedFile(null);
      return;
    }

    const fileToMove = draggedFile;
    setDraggedFile(null);

    showToast(`Moving "${fileToMove.name}" to ${targetFolder}...`);

    try {
      await moveFileOptimistic(fileToMove, targetFolder);
      showToast(`Moved to "${targetFolder}" successfully!`);
    } catch (err: any) {
      console.error("Move error:", err);
      showToast(`Failed to move: ${err.message}`);
    }
  };

  // Handle single move from dropdown
  const handleMoveFile = async (file: FileItem, targetFolder: string) => {
    if (file.folder === targetFolder) return;

    showToast(`Moved to ${targetFolder}`);
    try {
      await moveFileOptimistic(file, targetFolder);
    } catch (err: any) {
      showToast(`Failed to move: ${err.message}`);
    }
  };

  // Handle bulk move
  const handleMoveMultiple = async (fileNames: string[], targetFolder: string) => {
    showToast(`Moving ${fileNames.length} images to ${targetFolder}...`);
    try {
      const res = await moveMultipleOptimistic(fileNames, targetFolder);
      showToast(`Moved ${res.count ?? fileNames.length} images to ${targetFolder}`);
    } catch (err: any) {
      showToast(`Failed to move files: ${err.message}`);
    }
  };

  // Handle single delete
  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(`Delete image "${file.name}" permanently?`)) return;

    try {
      await deleteFileOptimistic(file);
      showToast("File deleted");
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`);
    }
  };

  // Handle bulk delete
  const handleDeleteMultiple = async (fileNames: string[]) => {
    showToast(`Deleting ${fileNames.length} images...`);
    try {
      const res = await deleteMultipleOptimistic(fileNames);
      showToast(`Deleted ${res.count ?? fileNames.length} images`);
    } catch (err: any) {
      showToast(`Failed to delete files: ${err.message}`);
    }
  };

  // Handle permanent image rotation
  const handleRotateFile = async (file: FileItem, degrees: number) => {
    showToast(`Saving rotation (${degrees}°) for "${file.name}"...`);
    try {
      const res = await rotateImageOptimistic(file, degrees);
      // If currently previewing this file in modal, update its URL with the cache-busting timestamp
      if (previewFile && (previewFile.id === file.id || previewFile.name === file.name)) {
        setPreviewFile((prev) =>
          prev ? { ...prev, url: res.updatedUrl } : null
        );
      }
      showToast(`Saved rotation for "${file.name}"!`);
    } catch (err: any) {
      console.error("Rotation error:", err);
      showToast(`Failed to rotate: ${err.message}`);
      throw err;
    }
  };

  // Folder modal submit (Create or Rename)
  const handleFolderModalSubmit = async (folderName: string): Promise<boolean> => {
    if (folderToRename) {
      try {
        await renameFolderOptimistic(folderToRename.name, folderName);
        showToast(`Renamed folder to "${folderName}"`);
        setFolderToRename(null);
        return true;
      } catch (err: any) {
        showToast(`Failed to rename: ${err.message}`);
        return false;
      }
    } else {
      try {
        await createFolderOptimistic(folderName);
        showToast(`Folder "${folderName}" created`);
        return true;
      } catch (err: any) {
        showToast(`Failed to create folder: ${err.message}`);
        return false;
      }
    }
  };

  // Delete folder click
  const handleDeleteFolderClick = async (folder: FolderItem) => {
    if (
      !confirm(
        `Are you sure you want to delete folder "${folder.displayName}"? Any files inside will be moved back to the public unsorted folder.`
      )
    ) {
      return;
    }

    try {
      await deleteFolderOptimistic(folder.name);
      showToast(`Folder "${folder.displayName}" deleted`);
    } catch (err: any) {
      alert(err.message || "Failed to delete folder");
    }
  };

  // Handle drop from desktop directly into right pane
  const handleDropFromDesktop = async (desktopFiles: FileList) => {
    showToast(`Compressing and uploading ${desktopFiles.length} images...`);
    try {
      const compressedFiles: File[] = [];
      for (let i = 0; i < desktopFiles.length; i++) {
        const f = desktopFiles[i];
        if (f.type.startsWith("image/")) {
          const res = await compressImageToWebP(f);
          compressedFiles.push(res.file);
        } else {
          compressedFiles.push(f);
        }
      }

      const fd = new FormData();
      compressedFiles.forEach((f) => fd.append("files", f));

      const res = await uploadFiles(activeFolderName, fd);
      if (res.success) {
        showToast(`Uploaded ${res.uploadedFiles.length} images to ${activeFolderName}!`);
        handleUploadCompleted(res.uploadedFiles, activeFolderName);
      } else {
        showToast(`Upload failed: ${res.error}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Upload error: ${err.message}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Top Banner / Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/70 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">File Manager</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Organize store media & images</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-emerald-500 font-medium">
                Locally cached • Fast instant loading
              </span>
            </p>
          </div>
        </div>

        {/* Quick Stats Pill & Background Sync Indicator */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          {(isFetchingFiles || isFetchingFolders) && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-semibold text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Quietly checking for updates...</span>
            </div>
          )}

          {stats && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5">
                <Files className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Files:</span>
                <span className="text-foreground">{stats.totalFiles}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Storage Used:</span>
                <span className="text-foreground">{stats.formattedTotalSize}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Split Window: Left Folders (User + Public) | Right Files (Public Unsorted default) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Folders List (Drop targets) */}
        <div className="w-64 sm:w-72 md:w-80 shrink-0 h-full overflow-hidden">
          <FolderList
            folders={folders}
            activeFolder={activeFolderName}
            onSelectFolder={(name) => setActiveFolderName(name)}
            onCreateFolderClick={() => {
              setFolderToRename(null);
              setIsCreateFolderOpen(true);
            }}
            onRenameFolderClick={(folder) => {
              setFolderToRename(folder);
              setIsCreateFolderOpen(true);
            }}
            onDeleteFolderClick={handleDeleteFolderClick}
            onDropOnFileFolder={handleDropOnFolder}
            draggedFileName={draggedFile ? draggedFile.name : null}
          />
        </div>

        {/* Right Side: Files Panel (Displays Public Unsorted images by default) */}
        <div className="flex-1 h-full overflow-hidden">
          <FileList
            currentFolder={activeFolderItem}
            currentFolderName={activeFolderName}
            files={files}
            isLoading={isLoadingFiles && files.length === 0}
            isFetching={isFetchingFiles}
            onRefresh={refreshAll}
            onUploadClick={() => setIsUploadOpen(true)}
            onDropFromDesktop={handleDropFromDesktop}
            onBackToPublicClick={() => setActiveFolderName("public")}
            availableFolders={folders}
            onMoveFile={handleMoveFile}
            onMoveMultiple={handleMoveMultiple}
            onDeleteFile={handleDeleteFile}
            onDeleteMultiple={handleDeleteMultiple}
            onPreviewFile={(f) => setPreviewFile(f)}
            onDragStart={handleDragStart}
            onRotateFile={handleRotateFile}
          />
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetFolder={activeFolderName}
        availableFolders={folders}
        onUploadComplete={(newFiles, folder) => {
          if (newFiles && folder) {
            handleUploadCompleted(newFiles, folder);
          } else {
            refreshAll();
          }
        }}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => {
          setIsCreateFolderOpen(false);
          setFolderToRename(null);
        }}
        onSubmit={handleFolderModalSubmit}
        initialName={folderToRename?.displayName || ""}
        isRenaming={!!folderToRename}
      />

      <ImagePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDelete={handleDeleteFile}
        onMoveToFolder={handleMoveFile}
        availableFolders={folders}
        onRotate={handleRotateFile}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
