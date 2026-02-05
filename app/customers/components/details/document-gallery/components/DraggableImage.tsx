"use client";

import React from "react";
import Image from "next/image";
import { Trash2, Edit2, Check, X } from "lucide-react";

export interface DraggableImageProps {
  src: string;
  name: string;
  isEditing: boolean;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onStartRename: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
  isOptimistic?: boolean;
  srcIsBlob?: boolean;
}

export const DraggableImage = ({
  src,
  name,
  isEditing,
  editingName,
  onEditNameChange,
  onSaveRename,
  onCancelRename,
  onStartRename,
  onClick,
  onDragStart,
  onDelete,
  isOptimistic,
  srcIsBlob,
}: DraggableImageProps) => {
  return (
    <div className={`group relative ${isOptimistic ? "pointer-events-none" : ""}`}>
      <div
        draggable={!isOptimistic}
        onDragStart={onDragStart}
        onClick={onClick}
        className={`relative bg-gray-900 border border-gray-700/50 rounded-xl aspect-video overflow-hidden transition-all ${
          isOptimistic
            ? "opacity-50 cursor-wait"
            : "hover:border-blue-500/50 cursor-grab active:cursor-grabbing"
        }`}
      >
        {srcIsBlob ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="opacity-80 group-hover:opacity-100 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {isOptimistic ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex justify-center items-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded font-medium text-white text-xs">
                View
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="top-1 right-1 absolute bg-black/50 hover:bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>

      <div className="mt-1 px-1">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={editingName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveRename();
                if (e.key === "Escape") onCancelRename();
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 px-1 py-0.5 border border-blue-500 rounded w-full min-w-0 text-white text-xs focus:outline-none"
            />
            <button
              onClick={onSaveRename}
              className="text-green-400 hover:text-green-300"
            >
              <Check size={12} />
            </button>
            <button
              onClick={onCancelRename}
              className="text-red-400 hover:text-red-300"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center group/name">
            <span
              className="font-medium text-gray-400 text-xs truncate"
              title={name}
            >
              {name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartRename();
              }}
              className="opacity-0 group-hover/name:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
            >
              <Edit2 size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
