"use client";

import React, { useState, useRef } from "react";
import { FolderItem, UploadProgressItem } from "../types";
import {
  compressImageToWebP,
  formatFileSize,
} from "../utils/compression";
import { uploadFiles } from "@/app/actions/fileManager";
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FolderInput,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFolder: string;
  availableFolders: FolderItem[];
  onUploadComplete: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  targetFolder: initialTargetFolder,
  availableFolders,
  onUploadComplete,
}) => {
  const [selectedFolder, setSelectedFolder] = useState(initialTargetFolder || "public");
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFolder(initialTargetFolder || "public");
      setUploadQueue([]);
      setIsProcessing(false);
    }
  }, [isOpen, initialTargetFolder]);

  if (!isOpen) return null;

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadProgressItem[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      originalSize: f.size,
      status: "idle",
      previewUrl: URL.createObjectURL(f),
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFilesChosen(e.dataTransfer.files);
  };

  const handleStartUpload = async () => {
    if (uploadQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);

    const compressedFiles: File[] = [];

    // Step 1: Compress each image to WebP
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      setUploadQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: "compressing" } : q))
      );

      try {
        const res = await compressImageToWebP(item.file);
        compressedFiles.push(res.file);

        setUploadQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  compressedSize: res.compressedSize,
                  savingsPercentage: res.savingsPercentage,
                  previewUrl: res.previewUrl,
                  status: "uploading",
                }
              : q
          )
        );
      } catch (err: any) {
        console.error("Compression error:", err);
        // Fallback to original file if compression fails
        compressedFiles.push(item.file);
        setUploadQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  compressedSize: item.file.size,
                  savingsPercentage: 0,
                  status: "uploading",
                }
              : q
          )
        );
      }
    }

    // Step 2: Send compressed files to server
    try {
      const fd = new FormData();
      compressedFiles.forEach((file) => {
        fd.append("files", file);
      });

      const res = await uploadFiles(selectedFolder, fd);
      if (!res.success) throw new Error(res.error || "Upload failed");

      setUploadQueue((prev) =>
        prev.map((q) => ({ ...q, status: "done" }))
      );

      setTimeout(() => {
        onUploadComplete();
        onClose();
      }, 1000);
    } catch (uploadErr: any) {
      console.error("Upload error:", uploadErr);
      setUploadQueue((prev) =>
        prev.map((q) => ({
          ...q,
          status: "error",
          error: uploadErr.message || "Upload failed",
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const removeQueueItem = (id: string) => {
    if (isProcessing) return;
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Compute batch statistics
  const totalOriginalSize = uploadQueue.reduce((acc, item) => acc + item.originalSize, 0);
  const totalCompressedSize = uploadQueue.reduce(
    (acc, item) => acc + (item.compressedSize || item.originalSize),
    0
  );
  const totalSaved = Math.max(0, totalOriginalSize - totalCompressedSize);
  const overallSavingsPercent =
    totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={!isProcessing ? onClose : undefined} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Upload Images</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-compressed to WebP to maximize storage savings</span>
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Target Folder Selector */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <FolderInput className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Upload destination:</span>
            </div>
            <select
              value={selectedFolder}
              disabled={isProcessing}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              {availableFolders.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.displayName} {f.isPublic ? "(Default / Unsorted)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
              ${
                isDraggingOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border/80 hover:border-primary/60 hover:bg-muted/30"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesChosen(e.target.files)}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Click to select images or drag and drop here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports PNG, JPEG, WebP, GIF • Automatically optimized
            </p>
          </div>

          {/* Queue List */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Selected {uploadQueue.length} files ({formatFileSize(totalOriginalSize)})</span>
                {overallSavingsPercent > 0 && (
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Estimated savings: -{overallSavingsPercent}%
                  </span>
                )}
              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border p-2 bg-muted/20 custom-scrollbar">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {item.previewUrl && (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(item.originalSize)}
                          {item.compressedSize !== undefined && (
                            <>
                              {" → "}
                              <span className="font-semibold text-emerald-500">
                                {formatFileSize(item.compressedSize)} (-{item.savingsPercentage}%)
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "compressing" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Compressing...</span>
                        </span>
                      )}
                      {item.status === "uploading" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Done</span>
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </span>
                      )}
                      {item.status === "idle" && (
                        <button
                          type="button"
                          onClick={() => removeQueueItem(item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border p-4 px-6 bg-card">
          <div className="text-xs text-muted-foreground">
            {uploadQueue.length > 0 && (
              <span>
                {uploadQueue.length} {uploadQueue.length === 1 ? "file" : "files"} ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isProcessing && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={isProcessing || uploadQueue.length === 0}
              onClick={handleStartUpload}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isProcessing
                  ? "Processing & Uploading..."
                  : `Upload to ${selectedFolder}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
