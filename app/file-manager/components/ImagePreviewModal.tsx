"use client";

import React, { useState } from "react";
import { FileItem, FolderItem } from "../types";
import { formatFileSize } from "../utils/compression";
import {
  X,
  Download,
  Copy,
  Trash2,
  FolderInput,
  Check,
  ExternalLink,
} from "lucide-react";

interface ImagePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDelete: (file: FileItem) => void;
  onMoveToFolder: (file: FileItem, targetFolder: string) => void;
  availableFolders: FolderItem[];
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  file,
  onClose,
  onDelete,
  onMoveToFolder,
  availableFolders,
}) => {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const displayFileName = (() => {
    const parts = file.name.split("_");
    if (parts.length > 1 && !isNaN(Number(parts[0]))) {
      return parts.slice(1).join("_");
    }
    return file.name;
  })();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Could not copy URL:", e);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = displayFileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const otherFolders = availableFolders.filter((f) => f.name !== file.folder);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 px-6">
          <div className="min-w-0 flex-1 pr-4">
            <h3
              className="truncate text-base font-bold text-foreground"
              title={displayFileName}
            >
              {displayFileName}
            </h3>
            <p className="text-xs text-muted-foreground">
              In folder: <span className="font-semibold text-primary">{file.folder}</span> •{" "}
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Image + Sidebar Details */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Main Image View */}
          <div className="relative flex flex-1 items-center justify-center bg-muted/40 p-4 min-h-[300px] md:min-h-[450px]">
            <img
              src={file.url}
              alt={displayFileName}
              className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
            />
          </div>

          {/* Details & Actions Sidebar */}
          <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border bg-card p-5 space-y-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  File Details
                </h4>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Original Name:</span>
                    <p className="font-medium text-foreground truncate" title={displayFileName}>
                      {displayFileName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <p className="font-medium text-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium text-foreground uppercase">
                      {file.mimetype.split("/")[1] || "webp"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded:</span>
                    <p className="font-medium text-foreground">
                      {new Date(file.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Move to another folder */}
              {otherFolders.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Move Folder
                  </h4>
                  <div className="space-y-1">
                    {otherFolders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          onMoveToFolder(file, folder.name);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-border/80 px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <span className="truncate">{folder.displayName}</span>
                        <FolderInput className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Copy Direct URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(file);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
