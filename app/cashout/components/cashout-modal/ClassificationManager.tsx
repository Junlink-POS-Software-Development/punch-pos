"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, ArrowRightLeft, Save, AlertCircle, Check } from "lucide-react";
import { useClassifications } from "../../hooks/useClassifications";
import { Classification } from "../../lib/cashout.api";

interface ClassificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_OPTIONS = [
  'Lightbulb', 'Wifi', 'Coffee', 'Wrench', 'Store', 'Truck', 'Briefcase', 'ShieldCheck', 'User', 'DollarSign'
];

export const ClassificationManager = ({ isOpen, onClose }: ClassificationManagerProps) => {
  const { classifications, addClassification, editClassification, removeClassification, checkUsage, transfer, isProcessing } = useClassifications();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('Store');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [transferToId, setTransferToId] = useState('');
  
  const [isAddingInPlace, setIsAddingInPlace] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (cls: Classification) => {
    setEditingId(cls.id);
    setEditName(cls.name);
    setEditIcon(cls.icon || 'Store');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName) return;
    await editClassification(editingId, editName, editIcon);
    setEditingId(null);
  };

  const handleDeleteAttempt = async (cls: Classification) => {
    const count = await checkUsage(cls.id);
    if (count > 0) {
      setUsageCount(count);
      setDeletingId(cls.id);
    } else {
      if (confirm(`Are you sure you want to delete "${cls.name}"?`)) {
        await removeClassification(cls.id);
      }
    }
  };

  const handleTransfer = async () => {
    if (!deletingId || !transferToId) return;
    await transfer(deletingId, transferToId);
    setDeletingId(null);
    setTransferToId('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Manage Categories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {deletingId ? (
            <div className="space-y-4 animate-in slide-in-from-right-2">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <div>
                  <h3 className="text-amber-500 font-bold">Category in Use</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are <strong>{usageCount}</strong> transactions currently associated with this category. You cannot delete it until you move them.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Transfer transactions to:</label>
                <select 
                  className="w-full bg-muted/20 border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-ring"
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                >
                  <option value="">Select a new category...</option>
                  {classifications.filter(c => c.id !== deletingId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTransfer}
                  disabled={!transferToId || isProcessing}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ArrowRightLeft size={18} />
                  Transfer & Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {classifications.map((cls) => (
                <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/10 group hover:bg-muted/20 transition-all">
                  {editingId === cls.id ? (
                    <div className="flex-1 flex gap-2 animate-in fade-in">
                      <input 
                        className="flex-1 bg-card border border-primary rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleSaveEdit} className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 border border-border rounded-lg hover:bg-card">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="text-xs uppercase font-bold">{cls.icon?.substring(0,2) || 'ST'}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground">{cls.name}</h4>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStartEdit(cls)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteAttempt(cls)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {!isAddingInPlace ? (
                <button 
                  onClick={() => setIsAddingInPlace(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  <Plus size={18} />
                  Add New Category
                </button>
              ) : (
                <div className="p-3 border border-primary bg-primary/5 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <input 
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                    placeholder="Category Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        if(!editName) return;
                        await addClassification(editName);
                        setEditName('');
                        setIsAddingInPlace(false);
                      }}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold"
                    >
                      Save Category
                    </button>
                    <button onClick={() => setIsAddingInPlace(false)} className="px-4 border border-border rounded-lg text-xs font-bold hover:bg-card">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/10 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Punch POS • Category Management</p>
        </div>
      </div>
    </div>
  );
};
