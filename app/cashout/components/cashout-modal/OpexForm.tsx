"use client";

import React, { useState } from "react";
import { Store, Plus, X, Lightbulb, Wifi, Coffee, Wrench, Truck, Briefcase, ShieldCheck, User } from "lucide-react";
import { CashoutInput } from "../../lib/cashout.api";
import { useClassifications } from "../../hooks/useClassifications";

interface OpexFormProps {
  data: Partial<CashoutInput>;
  onChange: (data: Partial<CashoutInput>) => void;
}

// Icon Map for Dynamic OpEx Categories
const ICON_MAP: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb size={24} />,
  Wifi: <Wifi size={24} />,
  Coffee: <Coffee size={24} />,
  Wrench: <Wrench size={24} />,
  Store: <Store size={24} />,
  Truck: <Truck size={24} />,
  Briefcase: <Briefcase size={24} />,
  ShieldCheck: <ShieldCheck size={24} />,
  User: <User size={24} />
};

export const OpexForm = ({ data, onChange }: OpexFormProps) => {
  const { classifications, addClassification, isProcessing } = useClassifications();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  // const [newCatIcon, setNewCatIcon] = useState('Store'); // Icon not yet supported in BE for classifications, default to Store

  const handleCreate = async () => {
      if(!newCatName) return;
      await addClassification(newCatName);
      setIsAddingCategory(false);
      setNewCatName('');
  };

  const handleSelect = (cls: any) => {
      onChange({
          ...data,
          classification_id: cls.id,
          expenseCategory: cls.name,
          icon: 'Store' // Default icon for now as classifications don't have icons in DB yet
      });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
       <div className="flex justify-between items-center mb-3">
         <label className="block text-sm font-medium text-foreground">Select Expense Category</label>
       </div>
       
       <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
         {classifications.map((cat) => (
           <button
            key={cat.id}
            onClick={() => handleSelect(cat)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border duration-200 group ${
              data.classification_id === cat.id 
                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-1' 
                : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
            }`}
           >
             <div className={`mb-2 p-2 rounded-full transition-colors ${data.classification_id === cat.id ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/20'}`}>
               {/* Fixed icon for now until DB supports it */}
               <Store size={20}/> 
             </div>
             <span className="text-xs font-semibold text-center">{cat.name}</span>
           </button>
         ))}
         
         {/* Add New Category Button */}
         {!isAddingCategory && (
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="flex flex-col items-center justify-center p-3 border border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Plus size={24} className="mb-2"/>
              <span className="text-xs font-medium">New</span>
            </button>
         )}
       </div>

       {/* Custom Category Creator */}
       {isAddingCategory && (
         <div className="bg-muted/30 p-4 rounded-xl border border-border mb-4 animate-in zoom-in-95">
           <div className="flex justify-between mb-3">
             <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Create Custom Category</span>
             <button onClick={() => setIsAddingCategory(false)} className="text-muted-foreground hover:text-red-500"><X size={16}/></button>
           </div>
           <div className="flex gap-2 items-center">
             <div className="relative flex-1">
                <input 
                    className="w-full border-input p-2.5 pl-3 rounded-lg text-sm focus:ring-ring border bg-card text-foreground" 
                    placeholder="Category Name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                />
             </div>
             {/* Icon selector integration pending BE support */}
             <button 
                onClick={handleCreate}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                  <Plus size={20} />
              </button>
           </div>
         </div>
       )}
    </div>
  );
};
