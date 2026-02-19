// app/inventory/components/item-registration/hooks/useItemReg.ts

import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { useItems } from "../../../hooks/useItems";
import { Item } from "../utils/itemTypes";
import { insertManyItems } from "../lib/item.api";
import { uploadItemImage } from "../lib/image.api";
import { useCategories } from "../../../hooks/useCategories";
import { useItemRegStore } from "../store/useItemRegStore";
import { insertStock } from "@/app/inventory/components/stock-management/lib/stocks.api";

const generateAutoSKU = (category?: string) => {
  const prefix = category ? category.substring(0, 2).toUpperCase() : "IT";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export const useItemReg = () => {
  // Use Zustand store for view state
  const { viewMode, setViewMode, addTab, setAddTab } = useItemRegStore();
  
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    sellingPrice: "",
    salesPrice: "",
    stock: "",
    minStock: "",
    imageUrl: null as string | null,
    imageSize: null as string | null,
  });

  const [batchRawText, setBatchRawText] = useState("");

  const { addItem, isProcessing } = useItems();
  const { categories } = useCategories();

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSKU = formData.sku.trim() || generateAutoSKU(formData.category);
    
    const selectedCat = categories.find(
      (c) => c.id === formData.category || c.category === formData.category
    );

    const newItem: Item = {
      itemName: formData.name,
      description: formData.description,
      category: selectedCat?.id || formData.category || undefined,
      sku: finalSKU,
      salesPrice: parseFloat(formData.salesPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      lowStockThreshold: parseInt(formData.minStock) || null,
      imageUrl: formData.imageUrl,
      categoryName: selectedCat?.category,
    };

    addItem(newItem, {
      onSuccess: async () => {
        // Handle Initial Stock
        const initialStock = parseFloat(formData.stock) || 0;
        if (initialStock > 0) {
          try {
            await insertStock({
              itemName: newItem.itemName,
              stockFlow: "stock-in",
              quantity: initialStock,
              capitalPrice: newItem.salesPrice || 0, // Using cost price as capital price
              notes: "Initial stock upon registration",
            });
          } catch (err) {
            console.error("Failed to insert initial stock:", err);
            // We don't block the UI for stock failure if item was created
          }
        }

        setFormData({
          name: "",
          description: "",
          category: "",
          sku: "",
          sellingPrice: "",
          salesPrice: "",
          stock: "",
          minStock: "",
          imageUrl: null,
          imageSize: null,
        });
        setViewMode("list");
      },
    });
  };

  const handleBatchProcess = async () => {
    if (!batchRawText) return;
    const rows = batchRawText.split("\n").filter((r) => r.trim() !== "");
    const newItems: Item[] = rows.map((row) => {
      const [name, cat, price, unitPrice, cost, , min, desc] = row
        .split(",")
        .map((s) => s.trim());
      
      const selectedCat = categories.find(
        (c) => c.category.toLowerCase() === (cat || "").toLowerCase()
      );

      return {
        itemName: name || "Unknown Item",
        description: desc || "",
        category: selectedCat?.id || undefined,
        sku: generateAutoSKU(cat),
        salesPrice: parseFloat(cost) || 0,
        sellingPrice: parseFloat(price) || 0,
        lowStockThreshold: parseInt(min) || null,
        imageUrl: null,
      };
    });
    try {
      await insertManyItems(newItems);
      setBatchRawText("");
      setViewMode("list");
    } catch (err) {
      alert(`Batch import failed: ${(err as Error).message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Image Compression Options
      const options = {
        maxSizeMB: 0.3, // 300KB
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      console.log(`Original file size: ${(file.size / 1024).toFixed(2)} KB`);
      
      // 2. Compress the image
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed file size: ${(compressedFile.size / 1024).toFixed(2)} KB`);

      const fd = new FormData();
      // We still want to keep the original file name/extension format but on the compressed Blob
      const finalFile = new File([compressedFile], file.name, { type: compressedFile.type });
      
      fd.append("file", finalFile);
      const publicUrl = await uploadItemImage(fd);
      setFormData((prev) => ({ 
        ...prev, 
        imageUrl: publicUrl,
        imageSize: `${(compressedFile.size / 1024).toFixed(2)} KB`
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    viewMode,
    setViewMode,
    addTab,
    setAddTab,
    formData,
    setFormData,
    batchRawText,
    setBatchRawText,
    isProcessing,
    isUploading,
    handleSingleSubmit,
    handleBatchProcess,
    handleImageUpload,
    categories,
  };
};

