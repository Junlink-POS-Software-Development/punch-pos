"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
  rotateAndSaveImage,
} from "@/app/actions/fileManager";

const STORAGE_KEY_LAST_FOLDER = "pos-file-manager-last-folder";

export function useFileManagerData() {
  const queryClient = useQueryClient();

  // 1. Remember last active folder in localStorage
  const [activeFolderName, setActiveFolderNameState] = useState<string>("public");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_FOLDER);
      if (saved && saved.trim()) {
        setActiveFolderNameState(saved);
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito restrictions)
    }
  }, []);

  const setActiveFolderName = useCallback((name: string) => {
    setActiveFolderNameState(name);
    try {
      localStorage.setItem(STORAGE_KEY_LAST_FOLDER, name);
    } catch {
      // Ignore
    }
  }, []);

  // 2. Query Folders (Cached in IndexedDB via QueryProvider)
  const {
    data: folders = [],
    isLoading: isLoadingFolders,
    isFetching: isFetchingFolders,
    refetch: refetchFolders,
    error: foldersError,
  } = useQuery<FolderItem[]>({
    queryKey: ["file-manager-folders"],
    queryFn: async () => {
      const res = await listFolders();
      if (!res.success) {
        throw new Error(res.error || "Failed to load folders");
      }
      return res.folders;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persist
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // 3. Query Files for current active folder (Cached in IndexedDB)
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    isFetching: isFetchingFiles,
    refetch: refetchFiles,
    error: filesError,
  } = useQuery<FileItem[]>({
    queryKey: ["file-manager-files", activeFolderName],
    queryFn: async () => {
      const res = await listFolderFiles(activeFolderName);
      if (!res.success) {
        throw new Error(res.error || "Failed to load files");
      }
      return res.files;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persist
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // 4. Query Storage Stats (Cached in IndexedDB)
  const {
    data: stats = null,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    refetch: refetchStats,
  } = useQuery<StorageStats | null>({
    queryKey: ["file-manager-stats"],
    queryFn: async () => {
      const res = await getStorageStats();
      if (!res.success) {
        return null;
      }
      return res.stats || null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Helper to refresh all queries
  const refreshAll = useCallback(async () => {
    await Promise.all([refetchFolders(), refetchFiles(), refetchStats()]);
  }, [refetchFolders, refetchFiles, refetchStats]);

  // 5. Optimistic Operations

  // Move single file
  const moveFileOptimistic = useCallback(
    async (file: FileItem, targetFolder: string) => {
      if (file.folder === targetFolder) return { success: true };

      const sourceFolder = file.folder;
      const movedFile: FileItem = {
        ...file,
        folder: targetFolder,
        updatedAt: new Date().toISOString(),
      };

      // 1. Optimistically update current folder's files
      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", sourceFolder],
        (old = []) => old.filter((f) => f.id !== file.id)
      );

      // 2. Optimistically add to destination folder's cached files
      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", targetFolder],
        (old = []) => [movedFile, ...old.filter((f) => f.name !== file.name)]
      );

      // 3. Optimistically update folder item counts
      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) =>
          old.map((f) => {
            if (f.name === sourceFolder) {
              return { ...f, fileCount: Math.max(0, f.fileCount - 1) };
            }
            if (f.name === targetFolder) {
              return { ...f, fileCount: f.fileCount + 1 };
            }
            return f;
          })
      );

      // 4. Server call
      try {
        const res = await moveFile(file.name, sourceFolder, targetFolder);
        if (!res.success) throw new Error(res.error);
        return { success: true };
      } catch (err: any) {
        // Rollback on failure
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", sourceFolder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", targetFolder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] }),
        ]);
        throw err;
      }
    },
    [queryClient]
  );

  // Move multiple files
  const moveMultipleOptimistic = useCallback(
    async (fileNames: string[], targetFolder: string) => {
      if (fileNames.length === 0 || activeFolderName === targetFolder) {
        return { success: true, count: 0 };
      }

      const sourceFolder = activeFolderName;
      const namesSet = new Set(fileNames);

      // 1. Optimistic remove from source
      const currentList = queryClient.getQueryData<FileItem[]>(["file-manager-files", sourceFolder]) || [];
      const movingItems = currentList.filter((f) => namesSet.has(f.name));

      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", sourceFolder],
        (old = []) => old.filter((f) => !namesSet.has(f.name))
      );

      // 2. Optimistic add to target
      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", targetFolder],
        (old = []) => [
          ...movingItems.map((f) => ({ ...f, folder: targetFolder })),
          ...old.filter((f) => !namesSet.has(f.name)),
        ]
      );

      // 3. Optimistic folder count
      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) =>
          old.map((f) => {
            if (f.name === sourceFolder) {
              return { ...f, fileCount: Math.max(0, f.fileCount - fileNames.length) };
            }
            if (f.name === targetFolder) {
              return { ...f, fileCount: f.fileCount + fileNames.length };
            }
            return f;
          })
      );

      // 4. Server call
      try {
        const res = await moveMultipleFiles(fileNames, sourceFolder, targetFolder);
        if (!res.success) throw new Error(res.error);
        return { success: true, count: res.movedCount };
      } catch (err: any) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", sourceFolder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", targetFolder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] }),
        ]);
        throw err;
      }
    },
    [queryClient, activeFolderName]
  );

  // Delete single file
  const deleteFileOptimistic = useCallback(
    async (file: FileItem) => {
      const folder = file.folder;

      // Optimistic removal
      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", folder],
        (old = []) => old.filter((f) => f.id !== file.id)
      );

      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) =>
          old.map((f) => (f.name === folder ? { ...f, fileCount: Math.max(0, f.fileCount - 1) } : f))
      );

      try {
        const res = await deleteFiles(folder, [file.name]);
        if (!res.success) throw new Error(res.error);
        queryClient.invalidateQueries({ queryKey: ["file-manager-stats"] });
        return { success: true };
      } catch (err: any) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", folder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] }),
        ]);
        throw err;
      }
    },
    [queryClient]
  );

  // Delete multiple files
  const deleteMultipleOptimistic = useCallback(
    async (fileNames: string[]) => {
      if (fileNames.length === 0) return { success: true };
      const folder = activeFolderName;
      const namesSet = new Set(fileNames);

      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", folder],
        (old = []) => old.filter((f) => !namesSet.has(f.name))
      );

      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) =>
          old.map((f) =>
            f.name === folder ? { ...f, fileCount: Math.max(0, f.fileCount - fileNames.length) } : f
          )
      );

      try {
        const res = await deleteFiles(folder, fileNames);
        if (!res.success) throw new Error(res.error);
        queryClient.invalidateQueries({ queryKey: ["file-manager-stats"] });
        return { success: true, count: res.deletedCount };
      } catch (err: any) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["file-manager-files", folder] }),
          queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] }),
        ]);
        throw err;
      }
    },
    [queryClient, activeFolderName]
  );

  // Create folder
  const createFolderOptimistic = useCallback(
    async (folderName: string) => {
      const res = await createFolder(folderName);
      if (!res.success || !res.folder) {
        throw new Error(res.error || "Failed to create folder");
      }

      const created = res.folder;
      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) => [...old, created]
      );
      queryClient.invalidateQueries({ queryKey: ["file-manager-stats"] });
      return created;
    },
    [queryClient]
  );

  // Rename folder
  const renameFolderOptimistic = useCallback(
    async (oldName: string, newName: string) => {
      const res = await renameFolder(oldName, newName);
      if (!res.success) {
        throw new Error(res.error || "Failed to rename folder");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] }),
        queryClient.invalidateQueries({ queryKey: ["file-manager-files", oldName] }),
        queryClient.invalidateQueries({ queryKey: ["file-manager-files", newName] }),
      ]);

      if (activeFolderName === oldName) {
        setActiveFolderName(newName);
      }
      return { success: true };
    },
    [queryClient, activeFolderName, setActiveFolderName]
  );

  // Delete folder
  const deleteFolderOptimistic = useCallback(
    async (folderName: string) => {
      const res = await deleteFolder(folderName, true);
      if (!res.success) {
        throw new Error(res.error || "Failed to delete folder");
      }

      queryClient.setQueryData<FolderItem[]>(
        ["file-manager-folders"],
        (old = []) => old.filter((f) => f.name !== folderName)
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["file-manager-files", "public"] }),
        queryClient.invalidateQueries({ queryKey: ["file-manager-stats"] }),
      ]);

      if (activeFolderName === folderName) {
        setActiveFolderName("public");
      }
      return { success: true };
    },
    [queryClient, activeFolderName, setActiveFolderName]
  );

  // After upload completed
  const handleUploadCompleted = useCallback(
    (uploadedFiles: FileItem[], targetFolder: string) => {
      if (uploadedFiles.length > 0) {
        // Prepend uploaded files to cached list
        queryClient.setQueryData<FileItem[]>(
          ["file-manager-files", targetFolder],
          (old = []) => [...uploadedFiles, ...old]
        );

        // Update folder count
        queryClient.setQueryData<FolderItem[]>(
          ["file-manager-folders"],
          (old = []) =>
            old.map((f) =>
              f.name === targetFolder ? { ...f, fileCount: f.fileCount + uploadedFiles.length } : f
            )
        );
      }

      // Invalidate in background to guarantee freshness
      queryClient.invalidateQueries({ queryKey: ["file-manager-files", targetFolder] });
      queryClient.invalidateQueries({ queryKey: ["file-manager-folders"] });
      queryClient.invalidateQueries({ queryKey: ["file-manager-stats"] });
    },
    [queryClient]
  );

  // Rotate image permanently in storage
  const rotateImageOptimistic = useCallback(
    async (file: FileItem, degrees: number) => {
      const folder = file.folder;
      const cacheBustTimestamp = Date.now();
      const updatedUrl = file.url.includes("?")
        ? `${file.url.split("?")[0]}?v=${cacheBustTimestamp}`
        : `${file.url}?v=${cacheBustTimestamp}`;

      // 1. Optimistically update the cached file's URL with cache-buster
      queryClient.setQueryData<FileItem[]>(
        ["file-manager-files", folder],
        (old = []) =>
          old.map((f) =>
            f.id === file.id || f.name === file.name
              ? { ...f, url: updatedUrl, updatedAt: new Date().toISOString() }
              : f
          )
      );

      // 2. Call server action to rotate and save in storage
      const res = await rotateAndSaveImage(file.name, folder, degrees);
      if (!res.success) {
        // Revert on error
        queryClient.invalidateQueries({ queryKey: ["file-manager-files", folder] });
        throw new Error(res.error || "Failed to save rotated image");
      }

      // 3. Update with exact new file size
      if (res.newSize) {
        queryClient.setQueryData<FileItem[]>(
          ["file-manager-files", folder],
          (old = []) =>
            old.map((f) =>
              f.name === file.name ? { ...f, size: res.newSize! } : f
            )
        );
      }

      return { success: true, updatedUrl };
    },
    [queryClient]
  );

  return {
    folders,
    isLoadingFolders,
    isFetchingFolders,
    foldersError,

    files,
    isLoadingFiles,
    isFetchingFiles,
    filesError,

    stats,
    isLoadingStats,
    isFetchingStats,

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
  };
}
