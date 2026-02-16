"use client";

import React, { useEffect } from "react";
import { Landmark, ShieldCheck, User, Briefcase } from "lucide-react";
import { CashoutInput } from "../../lib/cashout.api";

interface RemittanceFormProps {
  data: Partial<CashoutInput>;
  onChange: (data: Partial<CashoutInput>) => void;
}

const REMITTANCE_TYPES = [
  { id: 'bank', label: 'Transfer to Bank', icon: <Landmark size={20} className="text-blue-600"/> },
  { id: 'safe', label: 'Transfer to Safe', icon: <ShieldCheck size={20} className="text-green-600"/> },
  { id: 'manager', label: 'Remit to Manager', icon: <User size={20} className="text-purple-600"/> },
  { id: 'drawings', label: "Owner's Drawings", icon: <Briefcase size={20} className="text-orange-600"/> },
];

const generateRefNumber = () => `REF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

export const RemittanceForm = ({ data, onChange }: RemittanceFormProps) => {
  const { subType, referenceNo } = data;

  useEffect(() => {
    // Generate ref number on mount if not present
    if (!referenceNo) {
        onChange({ ...data, referenceNo: generateRefNumber(), subType: subType || 'bank' });
    }
  }, []);

  const handleTypeChange = (id: string) => {
      const type = REMITTANCE_TYPES.find(r => r.id === id);
      onChange({
          ...data, 
          subType: id, 
          subTypeLabel: type?.label
      });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-muted/30 border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
                <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">System Reference</span>
                <span className="text-xs text-muted-foreground">Auto-generated for audit</span>
            </div>
         </div>
         <span className="font-mono bg-card px-3 py-1.5 rounded-lg border border-border text-foreground text-sm font-bold shadow-sm tracking-wide select-all">{referenceNo}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Transfer Destination</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REMITTANCE_TYPES.map((type) => (
            <label 
                key={type.id} 
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                    subType === type.id 
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary' 
                    : 'bg-card hover:bg-muted/50 hover:border-border'
                }`}
            >
              <input 
                type="radio" 
                name="remitType" 
                className="sr-only" // Hide default radio
                checked={subType === type.id}
                onChange={() => handleTypeChange(type.id)}
              />
              {/* Custom Radio Circle */}
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${subType === type.id ? 'border-primary' : 'border-muted-foreground'}`}>
                  {subType === type.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
              </div>

              <div className="p-1.5 bg-muted rounded-lg">{type.icon}</div>
              <span className="text-sm font-medium text-foreground">{type.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
