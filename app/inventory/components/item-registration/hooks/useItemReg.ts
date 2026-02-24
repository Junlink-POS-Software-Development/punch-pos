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
  const { categories, addCategory } = useCategories();

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

  // ... (previous code) ...

  const [batchStep, setBatchStep] = useState<"input" | "review">("input");
  const [parsedBatchItems, setParsedBatchItems] = useState<any[]>([]);

  const handleBatchParse = () => {
    if (!batchRawText) return;
    const rows = batchRawText.split("\n").filter((r) => r.trim() !== "");
    
    const newItems = rows.map((row, index) => {
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

  const handleBatchSubmit = async (finalItems: any[], autoCreateCategories: boolean = true) => {
    try {
        let currentCategories = [...categories];

        if (autoCreateCategories) {
            // Find unique categories that need to be created
            const uniqueIncomingCategories = Array.from(new Set(finalItems.map(i => (i.category || "").trim()).filter(Boolean)));
            
            for (const catName of uniqueIncomingCategories) {
                const existing = currentCategories.find(c => c.category.toLowerCase() === catName.toLowerCase());
                if (!existing) {
                    console.log(`Auto-creating category: ${catName}`);
                    const newCat = await addCategory(catName);
                    if (newCat) {
                        currentCategories.push(newCat);
                    }
                }
            }
        }

        const itemsToInsert = finalItems.map(item => {
             const catNameTrimmed = (item.category || "").trim();
             const selectedCat = currentCategories.find(
                 (c) => c.category.toLowerCase() === catNameTrimmed.toLowerCase()
             );
             
             if (!selectedCat && !autoCreateCategories) {
                 throw new Error(`Category '${item.category}' not found and auto-create is disabled.`);
             }

             return {
                 itemName: item.itemName,
                 description: item.description,
                 category: selectedCat?.id, // Use resolved ID
                 sku: item.sku || generateAutoSKU(selectedCat?.category),
                 salesPrice: item.salesPrice,
                 sellingPrice: item.sellingPrice,
                 lowStockThreshold: item.lowStockThreshold,
                 imageUrl: null,
                 categoryName: selectedCat?.category || item.category,
             };
        });

        // 1. Insert Items
        await insertManyItems(itemsToInsert); 
        
        // For now, clear and reset
        setBatchRawText("");
        setParsedBatchItems([]);
        setBatchStep("input");
        setViewMode("list");

    } catch (err) {
      console.error(err);
      alert("Batch import failed. See console for details.");
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

