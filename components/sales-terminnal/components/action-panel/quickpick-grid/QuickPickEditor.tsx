"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { useItems } from '@/app/inventory/hooks/useItems';
import { QuickPickItem } from './hooks/useQuickPickItems';
import { Item } from '@/app/inventory/components/item-registration/utils/itemTypes';

type QuickPickItemInput = Omit<QuickPickItem, 'id'>;

interface QuickPickEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: QuickPickItem[];
  onSave: (items: QuickPickItemInput[]) => Promise<void>;
}

export const QuickPickEditor = ({ isOpen, onClose, currentItems, onSave }: QuickPickEditorProps) => {
  const { items: inventoryItems, isLoading: isLoadingInventory } = useItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<QuickPickItemInput[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'customize'>('select');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Initialize selected items from current items
      // We need to map them back to the structure we use for editing
      const initialSelection = currentItems.map(item => ({
        item_id: item.item_id,
        label: item.label,
        color: item.color,
        image_url: item.image_url,
        position: item.position,
        item: item.item // Keep the joined item data for display
      }));
      setSelectedItems(initialSelection);
      setActiveTab('select');
    }
  }, [isOpen, currentItems]);

  const filteredInventory = inventoryItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleItem = (item: Item) => {
    if (!item.id) return;

    const isSelected = selectedItems.some(si => si.item_id === item.id);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(si => si.item_id !== item.id));
    } else {
      if (selectedItems.length >= 20) {
        alert("You can only select up to 20 items.");
        return;
      }
      // Add new item with default settings
      setSelectedItems(prev => [...prev, {
        item_id: item.id!,
        label: item.itemName,
        color: 'bg-blue-500',
        image_url: item.imageUrl || undefined,
        position: prev.length,
        item: item
      }]);
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<QuickPickItemInput>) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedItems);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 lg:p-12">
      <div className="bg-card w-[90vw] h-[85vh] rounded-xl shadow-lg border border-border flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h2 className="text-xl font-bold">Edit Quick Pick Items ({selectedItems.length}/20)</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('select')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'select' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              1. Select Items
            </button>
            <button 
              onClick={() => setActiveTab('customize')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'customize' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              2. Customize
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex bg-card">
          {activeTab === 'select' ? (
            <div className="w-full flex flex-col">
              <div className="p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingInventory ? (
                  <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
                ) : (
                  <table className="w-full text-left border-collapse text-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-sm">
                        <th className="p-2 w-10"></th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map(item => {
                        const isSelected = selectedItems.some(si => si.item_id === item.id);
                        return (
                          <tr 
                            key={item.id} 
                            className={`
                              border-b border-border hover:bg-muted/50 cursor-pointer
                              ${isSelected ? 'bg-primary/10' : ''}
                            `}
                            onClick={() => handleToggleItem(item)}
                          >
                            <td className="p-2">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {}} // Handled by row click
                                className="rounded border-input text-primary focus:ring-ring"
                              />
                            </td>
                            <td className="p-2 font-medium">{item.itemName}</td>
                            <td className="p-2 text-muted-foreground text-sm">{item.sku}</td>
                            <td className="p-2 text-muted-foreground text-sm">{item.categoryName || '-'}</td>
                            <td className="p-2 text-right font-mono text-foreground">
                              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.sellingPrice ?? 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 overflow-y-auto bg-card">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedItems.map((item, idx) => (
                  <div key={item.item_id} className="border border-border rounded-lg p-4 flex flex-col gap-3 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                      <button 
                        onClick={() => item.item && handleToggleItem(item.item)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateItem(idx, { label: e.target.value })}
                        className="w-full px-2 py-1 text-sm rounded border border-input bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-gray-500', 'bg-indigo-500'].map(color => (
                          <button
                            key={color}
                            onClick={() => handleUpdateItem(idx, { color })}
                            className={`w-6 h-6 rounded-full ${color} ${item.color === color ? 'ring-2 ring-offset-2 ring-ring' : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    {item.image_url && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Image Fit</label>
                        <div className="flex gap-2">
                          {[
                            { label: 'Cover', value: 'bg-cover' },
                            { label: 'Contain', value: 'bg-contain' }
                          ].map(fit => {
                             const [currentColor, currentFit = 'bg-cover'] = item.color.split('|');
                             return (
                              <button
                                key={fit.value}
                                onClick={() => handleUpdateItem(idx, { color: `${currentColor}|${fit.value}` })}
                                className={`px-3 py-1 text-xs rounded-md border transition-all ${
                                  currentFit === fit.value 
                                    ? 'bg-primary text-primary-foreground border-primary font-bold' 
                                    : 'bg-background text-foreground border-input hover:bg-muted'
                                }`}
                              >
                                {fit.label}
                              </button>
                             );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 p-1 rounded-lg border border-dashed border-border flex items-center justify-center min-h-[70px] bg-card">
                      {(() => {
                        const [pureColor, fitClass = 'bg-cover'] = item.color.split('|');
                        return (
                          <button 
                            className={`
                              ${pureColor} text-white font-bold text-[10px] p-1 rounded shadow-sm w-full h-12 sm:h-16 flex items-center justify-center text-center relative overflow-hidden transition-all
                            `}
                          >
                            <span className="relative z-10 drop-shadow-md">{item.label}</span>
                            {item.image_url && (
                              <div 
                                className={`absolute inset-0 ${fitClass} bg-center opacity-40`}
                                style={{ backgroundImage: `url(${item.image_url})` }}
                              />
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
