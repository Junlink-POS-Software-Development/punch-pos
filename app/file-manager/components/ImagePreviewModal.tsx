"use client";

import React, { useState, useEffect } from "react";
import { FileItem, FolderItem } from "../types";
import { formatFileSize } from "../utils/compression";
import {
  X,
  Download,
  Copy,
  Trash2,
  FolderInput,
  Check,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ImagePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDelete: (file: FileItem) => void;
  onMoveToFolder: (file: FileItem, targetFolder: string) => void;
  availableFolders: FolderItem[];
  onRotate?: (file: FileItem, degrees: number) => Promise<void>;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  file,
  onClose,
  onDelete,
  onMoveToFolder,
  availableFolders,
  onRotate,
}) => {
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isSavingRotation, setIsSavingRotation] = useState(false);
  const [rotationSaved, setRotationSaved] = useState(false);

  // Reset visual rotation & zoom when opened or when file changes
  useEffect(() => {
    setRotation(0);
    setZoom(1);
    setIsSavingRotation(false);
    setRotationSaved(false);
  }, [file?.id, file?.url]);

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

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
    setRotationSaved(false);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
    setRotationSaved(false);
  };

  const handleSavePermanentRotation = async () => {
    if (!file || rotation === 0 || isSavingRotation || !onRotate) return;
    setIsSavingRotation(true);

    try {
      await onRotate(file, rotation);
      setRotationSaved(true);
      // Once permanently rotated on disk/storage, reset the CSS rotation
      setTimeout(() => {
        setRotation(0);
        setRotationSaved(false);
      }, 600);
    } catch (err: any) {
      alert(`Failed to save rotation: ${err.message || "Unknown error"}`);
    } finally {
      setIsSavingRotation(false);
    }
  };

  const otherFolders = availableFolders.filter((f) => f.name !== file.folder);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
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
          {/* Main Image View & Interactive Canvas Container */}
          <div className="relative flex flex-1 items-center justify-center bg-muted/40 p-6 min-h-[350px] md:min-h-[500px] overflow-hidden">
            {/* Top Image Controls Bar */}
            <div className="absolute top-4 z-20 flex items-center gap-1.5 rounded-2xl border border-border/80 bg-background/90 p-1.5 shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={handleRotateLeft}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground hover:bg-muted hover:text-primary transition-all active:scale-95"
                title="Rotate Left 90° (Counter-Clockwise)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRotateRight}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground hover:bg-muted hover:text-primary transition-all active:scale-95"
                title="Rotate Right 90° (Clockwise)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-border mx-0.5" />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 2.5))}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground hover:bg-muted transition-all active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5))}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground hover:bg-muted transition-all active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {(rotation !== 0 || zoom !== 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setRotation(0);
                    setZoom(1);
                  }}
                  className="flex h-8 px-2 items-center justify-center rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Reset Orientation & Zoom"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Main Interactive Displayed Image */}
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
              <img
                src={file.url}
                alt={displayFileName}
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transition: isSavingRotation ? "none" : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
                }}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md select-none pointer-events-none"
              />
            </div>

            {/* Bottom Permanent Save Notification / Button (appears when rotated) */}
            {rotation !== 0 && onRotate && (
              <div className="absolute bottom-4 z-20 flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Rotated by <span className="text-primary font-bold">+{rotation}°</span>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSavingRotation}
                  onClick={handleSavePermanentRotation}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                  title="Save this orientation permanently to storage"
                >
                  {isSavingRotation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Storage...</span>
                    </>
                  ) : rotationSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Orientation Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Permanently</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Details & Actions Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card p-5 space-y-4 flex flex-col justify-between overflow-y-auto">
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

              {/* Rotate Actions in Sidebar */}
              {onRotate && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Rotate & Save
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      title="Rotate 90° Left"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Left 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      title="Rotate 90° Right"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Right 90°</span>
                    </button>
                  </div>
                  {rotation !== 0 && (
                    <button
                      type="button"
                      disabled={isSavingRotation}
                      onClick={handleSavePermanentRotation}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSavingRotation ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Rotation Permanently</span>
                    </button>
                  )}
                </div>
              )}

              {/* Move to another folder */}
              {otherFolders.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Move Folder
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
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

            {/* Bottom Action Buttons */}
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
