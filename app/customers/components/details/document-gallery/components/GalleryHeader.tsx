"use client";

import React from "react";
import { Folder, Plus } from "lucide-react";
import { UploadButton } from "./UploadButton";

interface GalleryHeaderProps {
  isCreatingFolder: boolean;
  setIsCreatingFolder: (value: boolean) => void;
  isCompressing: boolean;
  compressionProgress: number;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GalleryHeader = ({
  setIsCreatingFolder,
  isCompressing,
  compressionProgress,
  isUploading,
  onUpload
}: GalleryHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Folder className="text-blue-400" size={20} />
        <h3 className="font-bold text-white text-lg">Documents</h3>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-xs transition-colors"
        >
          <Plus size={14} />
          Folder
        </button>
        <UploadButton 
          isCompressing={isCompressing}
          compressionProgress={compressionProgress}
          isUploading={isUploading}
          onUpload={onUpload}
        />
      </div>
    </div>
  );
};
