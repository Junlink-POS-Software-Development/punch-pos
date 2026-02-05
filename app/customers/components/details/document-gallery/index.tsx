"use client";

import React from "react";
import { Plus } from "lucide-react";
import { DocumentGalleryProps } from "./types";
import { useDocumentGallery } from "./hooks/useDocumentGallery";
import { DraggableImage } from "./components/DraggableImage";
import { FolderItem } from "./components/FolderItem";
import { GalleryHeader } from "./components/GalleryHeader";
import { ImagePreview } from "./components/ImagePreview";

export const DocumentGallery = ({ customer }: DocumentGalleryProps) => {
  const {
    folders,
    ungroupedFiles,
    isUploading,
    isCompressing,
    compressionProgress,
    previewImage,
    setPreviewImage,
    newFolderName,
    setNewFolderName,
    isCreatingFolder,
    setIsCreatingFolder,
    expandedFolders,
    draggedFile,
    editingFile,
    setEditingFile,
    editingName,
    setEditingName,
    optimisticFiles,
    optimisticDeletions,
    handleCreateFolder,
    handleDeleteFolder,
    handleDeleteDocument,
    startRenaming,
    saveRename,
    handleUpload,
    onDragStart,
    onDropOnFolder,
    onDropOnUngrouped,
    toggleFolder,
    getFileName,
  } = useDocumentGallery(customer);

  return (
    <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
      <GalleryHeader 
        isCreatingFolder={isCreatingFolder}
        setIsCreatingFolder={setIsCreatingFolder}
        isCompressing={isCompressing}
        compressionProgress={compressionProgress}
        isUploading={isUploading}
        onUpload={handleUpload}
      />

      {isCreatingFolder && (
        <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="Folder name"
            className="bg-gray-900 px-3 py-1.5 border border-gray-600 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setIsCreatingFolder(false);
            }}
          />
          <button
            onClick={handleCreateFolder}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-white text-xs whitespace-nowrap"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingFolder(false)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-300 text-xs whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Folders */}
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isExpanded={expandedFolders.has(folder.id)}
            onToggle={() => toggleFolder(folder.id)}
            onDelete={() => handleDeleteFolder(folder.id)}
            onDrop={(e) => onDropOnFolder(e, folder.id)}
            draggedFile={draggedFile}
          >
            {folder.filePaths.filter(p => !optimisticDeletions.has(p)).length > 0 ? (
              folder.filePaths
                .filter(p => !optimisticDeletions.has(p))
                .map((path, idx) => (
                  <DraggableImage
                    key={`${folder.id}-${idx}`}
                    src={path}
                    name={getFileName(path)}
                    isEditing={editingFile === path}
                    editingName={editingName}
                    onEditNameChange={setEditingName}
                    onSaveRename={saveRename}
                    onCancelRename={() => setEditingFile(null)}
                    onStartRename={() => startRenaming(path, getFileName(path))}
                    onClick={() => setPreviewImage(path)}
                    onDragStart={(e) => onDragStart(e, path)}
                    onDelete={() => handleDeleteDocument(path)}
                  />
                ))
            ) : (
              <div className="col-span-full py-4 text-center text-gray-600 text-xs italic">
                Empty folder
              </div>
            )}
          </FolderItem>
        ))}

        {/* Ungrouped Files & Optimistic Uploads */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropOnUngrouped}
          className={`min-h-[100px] transition-colors rounded-xl ${
            draggedFile ? "bg-gray-800/50 border-2 border-dashed border-gray-600" : ""
          }`}
        >
          <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {ungroupedFiles
              .filter(path => !optimisticDeletions.has(path))
              .map((path, idx) => (
                <DraggableImage
                  key={`ungrouped-${idx}`}
                  src={path}
                  name={getFileName(path)}
                  isEditing={editingFile === path}
                  editingName={editingName}
                  onEditNameChange={setEditingName}
                  onSaveRename={saveRename}
                  onCancelRename={() => setEditingFile(null)}
                  onStartRename={() => startRenaming(path, getFileName(path))}
                  onClick={() => setPreviewImage(path)}
                  onDragStart={(e) => onDragStart(e, path)}
                  onDelete={() => handleDeleteDocument(path)}
                />
              ))}

            {optimisticFiles.map((optFile) => (
              <DraggableImage
                key={optFile.id}
                src={optFile.url}
                name={optFile.name}
                isOptimistic={true}
                srcIsBlob={true}
                isEditing={false}
                editingName=""
                onEditNameChange={() => {}}
                onSaveRename={() => {}}
                onCancelRename={() => {}}
                onStartRename={() => {}}
                onClick={() => {}}
                onDragStart={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>

          {ungroupedFiles.filter(p => !optimisticDeletions.has(p)).length === 0 && 
           optimisticFiles.length === 0 && 
           folders.length === 0 && (
            <div className="py-8 border-2 border-gray-700 border-dashed rounded-xl text-gray-500 text-sm text-center">
              No documents uploaded.
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
};
