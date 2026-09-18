"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderItem, FileItem, StorageStats } from "../types";
import {
  listFolders,
  listFolderFiles,
  createFolder,
  renameFolder,
  deleteFolder,
  moveFile,
  moveMultipleFiles,
  deleteFiles,
  getStorageStats,
  uploadFiles,
} from "@/app/actions/fileManager";
import { FolderList } from "./FolderList";
import { FileList } from "./FileList";
import { UploadModal } from "./UploadModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { compressImageToWebP } from "../utils/compression";
import {
  FolderArchive,
  HardDrive,
  Sparkles,
  Files,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export const FileManagerView: React.FC = () => {
  // Navigation & folders state
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [activeFolderName, setActiveFolderName] = useState<string>("public");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);

  // Loading states
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // 1. Fetch folders and initial stats
  const fetchFoldersAndStats = useCallback(async () => {
    try {
      setIsLoadingFolders(true);
      const [fRes, sRes] = await Promise.all([listFolders(), getStorageStats()]);

      if (fRes.success) {
        setFolders(fRes.folders);
      } else {
        setErrorMessage(fRes.error || "Failed to load folders");
      }

      if (sRes.success && sRes.stats) {
        setStats(sRes.stats);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // 2. Fetch files for active folder
  const fetchActiveFiles = useCallback(async (folderName: string) => {
    try {
      setIsLoadingFiles(true);
      const res = await listFolderFiles(folderName);
      if (res.success) {
        setFiles(res.files);
      } else {
        console.error(res.error);
        setFiles([]);
      }
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchFoldersAndStats();
  }, [fetchFoldersAndStats]);

  useEffect(() => {
    if (activeFolderName) {
      fetchActiveFiles(activeFolderName);
    }
  }, [activeFolderName, fetchActiveFiles]);

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

    // Optimistic UI updates:
    // Remove from current files list
    setFiles((prev) => prev.filter((f) => f.id !== fileToMove.id));

    // Update folder counts
    setFolders((prev) =>
      prev.map((f) => {
        if (f.name === fileToMove.folder) {
          return { ...f, fileCount: Math.max(0, f.fileCount - 1) };
        }
        if (f.name === targetFolder) {
          return { ...f, fileCount: f.fileCount + 1 };
        }
        return f;
      })
    );

    showToast(`Moving "${fileToMove.name}" to ${targetFolder}...`);

    try {
      const res = await moveFile(fileToMove.name, fileToMove.folder, targetFolder);
      if (!res.success) {
        throw new Error(res.error || "Failed to move file");
      }
      showToast(`Moved to "${targetFolder}" successfully!`);
      // Background re-fetch to ensure sync
      fetchFoldersAndStats();
    } catch (err: any) {
      console.error("Move error:", err);
      showToast(`Failed to move: ${err.message}`);
      // Revert files
      fetchActiveFiles(activeFolderName);
      fetchFoldersAndStats();
    }
  };

  // Handle single move from dropdown
  const handleMoveFile = async (file: FileItem, targetFolder: string) => {
    if (file.folder === targetFolder) return;

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setFolders((prev) =>
      prev.map((f) => {
        if (f.name === file.folder) return { ...f, fileCount: Math.max(0, f.fileCount - 1) };
        if (f.name === targetFolder) return { ...f, fileCount: f.fileCount + 1 };
        return f;
      })
    );

    showToast(`Moved to ${targetFolder}`);
    const res = await moveFile(file.name, file.folder, targetFolder);
    if (!res.success) {
      showToast(`Failed to move: ${res.error}`);
      fetchActiveFiles(activeFolderName);
    }
    fetchFoldersAndStats();
  };

  // Handle bulk move
  const handleMoveMultiple = async (fileNames: string[], targetFolder: string) => {
    setFiles((prev) => prev.filter((f) => !fileNames.includes(f.name)));
    showToast(`Moving ${fileNames.length} images to ${targetFolder}...`);

    const res = await moveMultipleFiles(fileNames, activeFolderName, targetFolder);
    if (res.success) {
      showToast(`Moved ${res.movedCount} images to ${targetFolder}`);
    } else {
      showToast(`Failed to move files: ${res.error}`);
    }
    fetchFoldersAndStats();
    fetchActiveFiles(activeFolderName);
  };

  // Handle single delete
  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(`Delete image "${file.name}" permanently?`)) return;

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setFolders((prev) =>
      prev.map((f) =>
        f.name === file.folder
          ? { ...f, fileCount: Math.max(0, f.fileCount - 1) }
          : f
      )
    );

    const res = await deleteFiles(file.folder, [file.name]);
    if (res.success) {
      showToast("File deleted");
    } else {
      showToast(`Failed to delete: ${res.error}`);
      fetchActiveFiles(activeFolderName);
    }
    fetchFoldersAndStats();
  };

  // Handle bulk delete
  const handleDeleteMultiple = async (fileNames: string[]) => {
    setFiles((prev) => prev.filter((f) => !fileNames.includes(f.name)));
    showToast(`Deleting ${fileNames.length} images...`);

    const res = await deleteFiles(activeFolderName, fileNames);
    if (res.success) {
      showToast(`Deleted ${res.deletedCount} images`);
    } else {
      showToast(`Failed to delete files: ${res.error}`);
    }
    fetchFoldersAndStats();
    fetchActiveFiles(activeFolderName);
  };

  // Folder modal submit (Create or Rename)
  const handleFolderModalSubmit = async (folderName: string): Promise<boolean> => {
    if (folderToRename) {
      // Rename
      const res = await renameFolder(folderToRename.name, folderName);
      if (!res.success) {
        throw new Error(res.error || "Failed to rename folder");
      }
      showToast(`Renamed folder to "${folderName}"`);
      if (activeFolderName === folderToRename.name) {
        setActiveFolderName(folderName);
      }
      setFolderToRename(null);
      await fetchFoldersAndStats();
      return true;
    } else {
      // Create
      const res = await createFolder(folderName);
      if (!res.success) {
        throw new Error(res.error || "Failed to create folder");
      }
      showToast(`Folder "${folderName}" created`);
      await fetchFoldersAndStats();
      return true;
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

    const res = await deleteFolder(folder.name, true);
    if (res.success) {
      showToast(`Folder "${folder.displayName}" deleted`);
      if (activeFolderName === folder.name) {
        setActiveFolderName("public");
      }
      fetchFoldersAndStats();
    } else {
      alert(res.error || "Failed to delete folder");
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
        fetchActiveFiles(activeFolderName);
        fetchFoldersAndStats();
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
                High-efficiency WebP storage
              </span>
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        {stats && (
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
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
            isLoading={isLoadingFiles}
            onRefresh={() => {
              fetchActiveFiles(activeFolderName);
              fetchFoldersAndStats();
            }}
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
          />
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetFolder={activeFolderName}
        availableFolders={folders}
        onUploadComplete={() => {
          fetchActiveFiles(activeFolderName);
          fetchFoldersAndStats();
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
