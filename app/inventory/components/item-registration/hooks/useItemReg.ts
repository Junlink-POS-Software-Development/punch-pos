// app/inventory/components/item-registration/hooks/useItemReg.ts

import React, { useState } from "react";
import { useItems } from "../../../hooks/useItems";
import { Item } from "../utils/itemTypes";
import { insertManyItems } from "../lib/item.api";
import { uploadItemImage } from "../lib/image.api";
import { useCategories } from "../../../hooks/useCategories";

const generateAutoSKU = (category?: string) => {
  const prefix = category ? category.substring(0, 2).toUpperCase() : "IT";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export type ViewMode = "list" | "add";
export type AddTab = "single" | "batch";

export const useItemReg = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [addTab, setAddTab] = useState<AddTab>("single");
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
    };

    addItem(newItem, {
      onSuccess: () => {
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
        });
        setViewMode("list");
      },
    });
  };

  const handleBatchProcess = async () => {
    if (!batchRawText) return;
    const rows = batchRawText.split("\n").filter((r) => r.trim() !== "");
    const newItems: Item[] = rows.map((row) => {
      const [name, cat, price, cost, , min, desc] = row
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
      const fd = new FormData();
      fd.append("file", file);
      const publicUrl = await uploadItemImage(fd);
      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
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
