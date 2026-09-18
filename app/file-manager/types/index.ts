export interface FolderItem {
  id: string;
  name: string;
  displayName: string;
  fileCount: number;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileItem {
  id: string;
  name: string;
  folder: string;
  size: number;
  mimetype: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalFolders: number;
  formattedTotalSize: string;
}

export interface UploadProgressItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize?: number;
  savingsPercentage?: number;
  previewUrl?: string;
  status: "idle" | "compressing" | "uploading" | "done" | "error";
  error?: string;
}
