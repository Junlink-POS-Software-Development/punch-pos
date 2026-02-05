"use client";

import React from "react";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  isCompressing: boolean;
  compressionProgress: number;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton = ({ isCompressing, compressionProgress, isUploading, onUpload }: UploadButtonProps) => {
  return (
    <label className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg font-medium text-white text-xs cursor-pointer transition-colors disabled:opacity-50">
      {isCompressing ? (
        <>
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
          {compressionProgress > 0 ? `Compressing (${compressionProgress}%)` : 'Compressing...'}
        </>
      ) : isUploading ? (
        <>
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
          Uploading...
        </>
      ) : (
        <>
          <Upload size={14} />
          Upload
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={isUploading || isCompressing}
      />
    </label>
  );
};
