"use client";

import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import {
  uploadCustomerDocument,
  updateCustomerDocumentMetadata,
  updateCustomer,
  deleteCustomerDocument,
} from "../../../../api/services";
import { useCustomerData } from "../../../../hooks/useCustomerData";
import { FolderType, OptimisticFile } from "../types";
import { Customer } from "../../../../lib/types";

export const useDocumentGallery = (customer: Customer) => {
  const { refreshCustomers } = useCustomerData();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [ungroupedFiles, setUngroupedFiles] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [optimisticFiles, setOptimisticFiles] = useState<OptimisticFile[]>([]);
  const [optimisticDeletions, setOptimisticDeletions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const meta = customer.document_metadata as { 
      folders: FolderType[]; 
      fileNames?: Record<string, string>;
    } | null;
    
    const currentFolders = meta?.folders || [];
    setFolders(currentFolders);
    setFileNames(meta?.fileNames || {});

    const filedPaths = new Set(currentFolders.flatMap((f) => f.filePaths));
    const allDocs = customer.documents || [];
    const ungrouped = allDocs.filter((doc: string) => !filedPaths.has(doc));
    setUngroupedFiles(ungrouped);
    
    // CLEANUP: Remove optimistic files once they appear in the real document list
    setOptimisticFiles(prev => prev.filter(opt => {
        if (!opt.finalUrl) return true; // Keep if still uploading
        return !allDocs.includes(opt.finalUrl); // Remove if now in real documents
    }));

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

    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    
    const releasedFiles = folderToDelete.filePaths;
    setUngroupedFiles(prev => [...prev, ...releasedFiles]);
    
    await saveMetadata(updatedFolders, fileNames);
  };

  const handleDeleteDocument = async (filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setOptimisticDeletions(prev => new Set(prev).add(filePath));

    try {
      await deleteCustomerDocument(customer.id, filePath);
      
      const updatedFolders = folders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
      
      const updatedFileNames = { ...fileNames };
      delete updatedFileNames[filePath];
      
      await saveMetadata(updatedFolders, updatedFileNames);
      refreshCustomers();
    } catch (error) {
      console.error("Failed to delete document:", error);
      setOptimisticDeletions(prev => {
        const next = new Set(prev);
        next.delete(filePath);
        return next;
      });
      alert("Failed to delete document. Please try again.");
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

    if (file.size > 20 * 1024 * 1024) {
      alert("This file is too large (>20MB). Please select a smaller file.");
      e.target.value = "";
      return;
    }

    const tempId = crypto.randomUUID();
    const tempUrl = URL.createObjectURL(file);

    setOptimisticFiles(prev => [...prev, { id: tempId, url: tempUrl, name: file.name }]);
    
    try {
      let fileToUpload = file;
      
      if (file.type.startsWith("image/")) {
        setIsCompressing(true);
        setCompressionProgress(0);
        const options = {
          maxSizeMB: 0.5, // Faster target
          maxWidthOrHeight: 1600, // Faster resolution
          useWebWorker: true,
          initialQuality: 0.7, // Slightly lower for speed
          onProgress: (p: number) => setCompressionProgress(Math.round(p)),
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
        } finally {
          setIsCompressing(false);
          setCompressionProgress(0);
        }
      }

      setIsUploading(true);
      const publicUrl = await uploadCustomerDocument(customer.id, fileToUpload);
      
      // FIX: Restore the update to the customer record
      const currentDocs = customer.documents || [];
      const updatedDocs = [publicUrl, ...currentDocs];
      await updateCustomer(customer.id, { documents: updatedDocs });
      
      const updatedFileNames = {
        ...fileNames,
        [publicUrl]: file.name,
      };
      setFileNames(updatedFileNames);
      await saveMetadata(folders, updatedFileNames);
      
      // PERSISTENCE: Mark optimistic file as "finished" by assigning its final URL
      // This keeps it visible until the real image from refreshCustomers() arrives.
      setOptimisticFiles(prev => prev.map(f => f.id === tempId ? { ...f, finalUrl: publicUrl } : f));

      refreshCustomers();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. If the image is very large, try a smaller one.");
      // If it failed, we remove it immediately
      setOptimisticFiles(prev => prev.filter(f => f.id !== tempId));
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
      // We no longer remove the optimistic file here if it succeeded.
      // It will be cleaned up by the useEffect when customer.documents updates.
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

    let newUngrouped = [...ungroupedFiles];
    let newFolders = folders.map(f => ({ ...f, filePaths: [...f.filePaths] }));

    if (newUngrouped.includes(filePath)) {
      newUngrouped = newUngrouped.filter(p => p !== filePath);
    } else {
      newFolders = newFolders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
    }

    const targetFolderIndex = newFolders.findIndex(f => f.id === folderId);
    if (targetFolderIndex !== -1) {
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
      
      let newFolders = folders.map(f => ({
        ...f,
        filePaths: f.filePaths.filter(p => p !== filePath)
      }));
      
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
    try {
        const urlObj = new URL(path);
        const filename = urlObj.pathname.split("/").pop() || "";
        const nameParts = filename.split("_");
        if (nameParts.length > 1 && !isNaN(Number(nameParts[0]))) {
            return nameParts.slice(1).join("_");
        }
        return filename;
    } catch {
        return "Document";
    }
  };

  return {
    folders,
    ungroupedFiles,
    fileNames,
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
  };
};
