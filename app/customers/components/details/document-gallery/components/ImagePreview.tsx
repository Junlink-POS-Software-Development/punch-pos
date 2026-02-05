"use client";

import React from "react";
import { X } from "lucide-react";

export interface ImagePreviewProps {
  src: string;
  onClose: () => void;
}

export const ImagePreview = ({ src, onClose }: ImagePreviewProps) => {
  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm p-4 animate-in duration-200 fade-in"
      onClick={onClose}
    >
      <button 
        className="top-4 right-4 absolute hover:bg-white/10 p-2 rounded-full text-white hover:text-gray-300 transition-colors"
        onClick={onClose}
      >
        <X size={32} />
      </button>
      <img
        src={src}
        alt="Preview"
        className="shadow-2xl rounded-lg max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
