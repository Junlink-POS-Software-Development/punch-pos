"use client";

import React from "react";
import { Camera, Loader2 } from "lucide-react";

interface StoreLogoUploadProps {
  logoPreview: string | null;
  isUploading: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function StoreLogoUpload({
  logoPreview,
  isUploading,
  onSelect,
  inputRef,
}: StoreLogoUploadProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative group cursor-pointer shrink-0"
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-xl bg-muted/40 border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : logoPreview ? (
            <img
              src={logoPreview}
              alt="Store logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-5 h-5 text-muted-foreground/50" />
          )}
        </div>
        {logoPreview && (
          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
        )}
        <input
          type="file"
          ref={inputRef}
          onChange={onSelect}
          accept="image/*"
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Store Logo</p>
        <p className="text-xs text-muted-foreground">Click to upload (optional)</p>
      </div>
    </div>
  );
}
