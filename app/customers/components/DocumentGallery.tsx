"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  Upload,
  Plus,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  Edit2,
  Check,
} from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  uploadCustomerDocument,
  updateCustomerDocumentMetadata,
  updateCustomer,
  deleteCustomerDocument,
} from "../api/services";
import { Customer } from "../lib/types";
import { useCustomerData } from "../hooks/useCustomerData";

interface DocumentGalleryProps {
  customer: Customer;
}

interface FolderType {
  id: string;
  name: string;
  filePaths: string[];
}

export const DocumentGallery = ({ customer }: DocumentGalleryProps) => {
  const { refreshCustomers } = useCustomerData();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [ungroupedFiles, setUngroupedFiles] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [optimisticFiles, setOptimisticFiles] = useState<Array<{ id: string; url: string; name: string }>>([]);

  useEffect(() => {
    // Initialize folders and files from customer data
    const meta = customer.document_metadata as { 
      folders: FolderType[]; 
      fileNames?: Record<string, string>;
    } | null;
    
    const currentFolders = meta?.folders || [];
    setFolders(currentFolders);
    setFileNames(meta?.fileNames || {});

    // Determine which files are already in folders
    const filedPaths = new Set(
      currentFolders.flatMap((f) => f.filePaths)
    );
    
    // All documents that are not in any folder are "ungrouped"
    const allDocs = customer.documents || [];
    const ungrouped = allDocs.filter((doc) => !filedPaths.has(doc));
    setUngroupedFiles(ungrouped);
    
    // Expand all folders by default
    setExpandedFolders(new Set(currentFolders.map(f => f.id)));
  }, [customer]);

  const saveMetadata = async (
    updatedFolders: FolderType[], 
    updatedFileNames: Record<string, string>
  ) => {
    try {
      await updateCustomerDocumentMetadata(customer.id, {
        folders: updatedFolders,
        fileNames: updatedFileNames,
      });
      refreshCustomers();
    } catch (error) {
      console.error("Failed to save folder structure:", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder: FolderType = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      filePaths: [],
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    setExpandedFolders(prev => new Set(prev).add(newFolder.id));
    setNewFolderName("");
    setIsCreatingFolder(false);
    await saveMetadata(updatedFolders, fileNames);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? Files will be moved to ungrouped.")) return;
    
    const folderToDelete = folders.find(f => f.id === folderId);
    if (!folderToDelete) return;

    // Remove folder
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    
    // Update local state for immediate feedback
    const releasedFiles = folderToDelete.filePaths;
    setUngroupedFiles(prev => [...prev, ...releasedFiles]);
    
    await saveMetadata(updatedFolders, fileNames);
  };

  const handleDeleteDocument = async (filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // 1. Delete from DB and Storage
      await deleteCustomerDocument(customer.id, filePath);
      
      // 2. Remove from any folder in metadata
      const updatedFolders = folders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
      
      // 3. Remove from fileNames
      const updatedFileNames = { ...fileNames };
      delete updatedFileNames[filePath];
      
      // 4. Save metadata if changed
      await saveMetadata(updatedFolders, updatedFileNames);

      refreshCustomers();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const startRenaming = (filePath: string, currentName: string) => {
    setEditingFile(filePath);
    setEditingName(currentName);
  };

  const saveRename = async () => {
    if (!editingFile) return;
    
    const updatedFileNames = {
      ...fileNames,
      [editingFile]: editingName.trim() || "Untitled",
    };
    
    setFileNames(updatedFileNames);
    setEditingFile(null);
    setEditingName("");
    
    await saveMetadata(folders, updatedFileNames);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const tempId = crypto.randomUUID();
    const tempUrl = URL.createObjectURL(file);

    // Optimistically add to UI
    setOptimisticFiles(prev => [...prev, { id: tempId, url: tempUrl, name: file.name }]);
    setIsUploading(true);

    try {
      let fileToUpload = file;
      
      // Compress if it's an image
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        };
        try {
          const compress = typeof imageCompression === 'function' 
            ? imageCompression 
            : (imageCompression as any).default;
            
          const compressedBlob = await compress(file, options);
          fileToUpload = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          });
        } catch (compressionError) {
          console.error("Compression failed in gallery, using original:", compressionError);
        }
      }

      const publicUrl = await uploadCustomerDocument(customer.id, fileToUpload);
      
      const currentDocs = customer.documents || [];
      const updatedDocs = [publicUrl, ...currentDocs];
      
      await updateCustomer(customer.id, { documents: updatedDocs });
      
      // Set default name
      const updatedFileNames = {
        ...fileNames,
        [publicUrl]: file.name,
      };
      setFileNames(updatedFileNames);
      await saveMetadata(folders, updatedFileNames);
      
      refreshCustomers();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. If the image is very large, try a smaller one.");
    } finally {
      setIsUploading(false);
      // Remove optimistic file and clean up URL
      setOptimisticFiles(prev => prev.filter(f => f.id !== tempId));
      URL.revokeObjectURL(tempUrl);
      e.target.value = "";
    }
  };

  const onDragStart = (e: React.DragEvent, filePath: string) => {
    e.dataTransfer.setData("text/plain", filePath);
    setDraggedFile(filePath);
  };

  const onDropOnFolder = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    const filePath = e.dataTransfer.getData("text/plain");
    if (!filePath) return;

    // Remove from ungrouped or other folders
    let newUngrouped = [...ungroupedFiles];
    let newFolders = folders.map(f => ({ ...f, filePaths: [...f.filePaths] }));

    // Check if it was in ungrouped
    if (newUngrouped.includes(filePath)) {
      newUngrouped = newUngrouped.filter(p => p !== filePath);
    } else {
      // Check other folders
      newFolders = newFolders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
    }

    // Add to target folder
    const targetFolderIndex = newFolders.findIndex(f => f.id === folderId);
    if (targetFolderIndex !== -1) {
       // Avoid duplicates
       if (!newFolders[targetFolderIndex].filePaths.includes(filePath)) {
           newFolders[targetFolderIndex].filePaths.push(filePath);
       }
    }

    setUngroupedFiles(newUngrouped);
    setFolders(newFolders);
    setDraggedFile(null);
    
    await saveMetadata(newFolders, fileNames);
  };
  
  const onDropOnUngrouped = async (e: React.DragEvent) => {
      e.preventDefault();
      const filePath = e.dataTransfer.getData("text/plain");
      if (!filePath) return;
      
      // Remove from folders
      let newFolders = folders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
      
      // Add to ungrouped if not exists
      if (!ungroupedFiles.includes(filePath)) {
          setUngroupedFiles([...ungroupedFiles, filePath]);
      }
      
      setFolders(newFolders);
      setDraggedFile(null);
      await saveMetadata(newFolders, fileNames);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileName = (path: string) => {
    if (fileNames[path]) return fileNames[path];
    // Fallback to extracting from URL if no custom name
    try {
        const urlObj = new URL(path);
        const pathname = urlObj.pathname;
        const parts = pathname.split("/");
        const filename = parts[parts.length - 1];
        // Remove timestamp prefix if present (format: timestamp_name)
        const nameParts = filename.split("_");
        if (nameParts.length > 1 && !isNaN(Number(nameParts[0]))) {
            return nameParts.slice(1).join("_");
        }
        return filename;
    } catch {
        return "Document";
    }
  };

  return (
    <div className="bg-gray-800 shadow-lg p-6 border border-gray-700 rounded-2xl">
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
          <label className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg font-medium text-white text-xs cursor-pointer transition-colors">
            <Upload size={14} />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

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
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-white text-xs"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingFolder(false)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-300 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropOnFolder(e, folder.id)}
            className={`border border-gray-700 rounded-xl overflow-hidden transition-colors ${
                draggedFile ? "border-dashed border-blue-500/50 bg-blue-500/5" : "bg-gray-900/30"
            }`}
          >
            <div
              className="flex justify-between items-center hover:bg-gray-800/50 p-3 cursor-pointer"
              onClick={() => toggleFolder(folder.id)}
            >
              <div className="flex items-center gap-2">
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
                <Folder size={16} className="text-blue-400" />
                <span className="font-medium text-gray-200 text-sm">
                  {folder.name}
                </span>
                <span className="text-gray-600 text-xs">
                  ({folder.filePaths.length})
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
                className="hover:bg-red-500/20 p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                title="Delete Folder"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {expandedFolders.has(folder.id) && (
              <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 p-3 pt-0">
                {folder.filePaths.length > 0 ? (
                    folder.filePaths.map((path, idx) => (
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
              </div>
            )}
          </div>
        ))}

        {/* Ungrouped Files */}
        <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropOnUngrouped}
            className={`min-h-[100px] transition-colors rounded-xl ${
                draggedFile ? "bg-gray-800/50 border-2 border-dashed border-gray-600" : ""
            }`}
        >
            {ungroupedFiles.length > 0 ? (
              <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {ungroupedFiles.map((path, idx) => (
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

                {/* Optimistic Uploads */}
                {optimisticFiles.map((optFile) => (
                  <DraggableImage
                    key={optFile.id}
                    src={optFile.url}
                    name={optFile.name}
                    isOptimistic={true}
                    srcIsBlob={true}
                    // No actions allowed for optimistic items
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
            ) : (
              folders.length === 0 && (
                  <div className="py-8 border-2 border-gray-700 border-dashed rounded-xl text-gray-500 text-sm text-center">
                    No documents uploaded.
                  </div>
              )
            )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm p-4 animate-in duration-200 fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button className="top-4 right-4 absolute hover:bg-white/10 p-2 rounded-full text-white hover:text-gray-300 transition-colors">
            <X size={32} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="shadow-2xl rounded-lg max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const DraggableImage = ({
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
}: {
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
}) => {
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
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
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
      
      {/* Name / Edit Input */}
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
                <button onClick={onSaveRename} className="text-green-400 hover:text-green-300">
                    <Check size={12} />
                </button>
                <button onClick={onCancelRename} className="text-red-400 hover:text-red-300">
                    <X size={12} />
                </button>
            </div>
        ) : (
            <div className="flex justify-between items-center group/name">
                <span className="font-medium text-gray-400 text-xs truncate" title={name}>
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
