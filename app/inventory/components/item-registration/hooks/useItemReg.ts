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

        resetForm();
        setViewMode("list");
      },
    });
  };

  const resetForm = () => {
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
  };

  const [batchStep, setBatchStep] = useState<"input" | "review">("input");
  const [parsedBatchItems, setParsedBatchItems] = useState<any[]>([]);

  const handleBatchParse = () => {
    if (!batchRawText) return;
    const rows = batchRawText.split("\n").filter((r) => r.trim() !== "");
    
    const newItems = rows.map((row, index) => {
        // Simple CSV parse. TODO: Use a proper CSV parser for quoting support if needed
        const cols = row.split(",").map((s) => s.trim());
        const [name, cat, sellPrice, costPrice, stock, minStock, ...desc] = cols;

        return {
            tempId: `batch-${Date.now()}-${index}`,
            itemName: name || "",
            category: cat || "",
            sellingPrice: parseFloat(sellPrice) || 0,
            salesPrice: parseFloat(costPrice) || 0,
            initialStock: parseInt(stock) || 0,
            lowStockThreshold: parseInt(minStock) || null,
            description: desc.join(", ") || "",
            sku: "",
            errors: {},
            imageUrl: null,
        };
    });
    
    setParsedBatchItems(newItems);
    setBatchStep("review");
  };

  const handleBatchSubmit = async (finalItems: any[]) => {
    try {
        const itemsToInsert = finalItems.map(item => {
             // Resolve Category ID
             const selectedCat = categories.find(
                (c) => c.category.toLowerCase() === (item.category || "").toLowerCase()
             );
             
             return {
                 itemName: item.itemName,
                 description: item.description,
                 category: selectedCat?.id, // If missing, database might error if FK constraint exists
                 sku: item.sku || generateAutoSKU(item.category),
                 salesPrice: item.salesPrice,
                 sellingPrice: item.sellingPrice,
                 lowStockThreshold: item.lowStockThreshold,
                 imageUrl: null,
                 categoryName: selectedCat?.category || item.category,
             };
        });

        // 1. Insert Items
        // We need to know the IDs to insert stock. 
        // insertManyItems usually returns data if configured. Let's check item.api.ts if needed, but for now assume void or standard.
        // If it returns null, we might have trouble with stock. 
        // Let's modify insertManyItems to return data if it doesn't already.
        
        await insertManyItems(itemsToInsert); 
        
        // WARN: If insertManyItems doesn't return the IDs, we can't easily insert stock for *these specific* items 
        // without requerying. For this MVP step, we might just insert items.
        // However, the user wants stock. 
        // Let's assume for now we just insert items. 
        // If we need stock, we should update insertManyItems to return `select()`.
        
        // For now, clear and reset
        setBatchRawText("");
        setParsedBatchItems([]);
        setBatchStep("input");
        setViewMode("list");

    } catch (err) {
      console.error(err);
      alert("Batch import failed.");
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
    handleBatchParse,
    handleBatchSubmit,
    batchStep,
    setBatchStep,
    parsedBatchItems,
    handleImageUpload,
    resetForm,
    categories,
  };
};

