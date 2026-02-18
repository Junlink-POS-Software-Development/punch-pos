"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Lightbulb, ArrowRight, X, DollarSign, Save, FileText, Unlock } from 'lucide-react';
import { CashoutInput, CashoutType } from '../../lib/cashout.api';
import DrawerSelect from "../shared/DrawerSelect";
import { CogsForm } from './CogsForm';
import { OpexForm } from './OpexForm';
import { RemittanceForm } from './RemittanceForm';
import { useExpenses } from '../../hooks/useExpenses'; // Reuse the hook logic
import { useTransactionStore } from '@/app/settings/backdating/stores/useTransactionStore';
import dayjs from 'dayjs';

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashOutModal = ({ isOpen, onClose }: CashOutModalProps) => {
  const { addExpense, isSubmitting } = useExpenses();
  const { customTransactionDate } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<CashoutType>('COGS'); 
  const [selectedDrawerId, setSelectedDrawerId] = useState<string>("");
  
  // Initialize with empty values to avoid hydration mismatch
  const [baseData, setBaseData] = useState<{amount: string, date: string, notes: string}>({
      amount: '',
      date: '',
      notes: ''
  });

  // Client-side initialization of date
  useEffect(() => {
    if (isOpen && !baseData.date) {
      const initialDate = customTransactionDate 
        ? dayjs(customTransactionDate).format("YYYY-MM-DD")
        : new Date().toISOString().split('T')[0];

      setBaseData(prev => ({
        ...prev,
        date: initialDate
      }));
    }
  }, [isOpen, baseData.date, customTransactionDate]);

  const [specificData, setSpecificData] = useState<Partial<CashoutInput>>({});

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!baseData.amount || parseFloat(baseData.amount) <= 0) return alert("Please enter a valid amount");
    if (!selectedDrawerId) return alert("Please select a drawer to withdraw from");

    const payload: CashoutInput = {
      transaction_date: baseData.date,
      amount: parseFloat(baseData.amount),
      notes: baseData.notes,
      cashout_type: activeTab,
      category_id: selectedDrawerId,
      ...specificData
    };

    if (activeTab === 'OPEX' && !payload.classification_id) {
        return alert("Please select an expense category");
    }

    try {
        await addExpense(payload);
        handleClose();
    } catch (e) {
        alert("Failed to save transaction");
    }
  };

  const handleClose = () => {
    setBaseData({ amount: '', date: '', notes: '' });
    setSpecificData({});
    setActiveTab('COGS');
    onClose();
  };

  const renderTabButton = (id: CashoutType, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-4 flex-1 justify-center transition-all border-b-2 text-sm font-semibold ${
        activeTab === id 
          ? 'border-primary text-primary bg-primary/5' 
          : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="bg-red-100/50 p-2 rounded-lg text-red-600">
                <DollarSign size={20} strokeWidth={3} />
              </div>
              Record Cash Out
            </h2>
            <p className="text-xs text-muted-foreground mt-1 ml-11">Punch POS • Drawer #1 • Session ID: 9942</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-border bg-muted/30">
          {renderTabButton('COGS', 'Cost of Goods', <Truck size={18} />)}
          {renderTabButton('OPEX', 'Op. Expenses', <Lightbulb size={18} />)}
          {renderTabButton('REMITTANCE', 'Remittance', <ArrowRight size={18} />)}
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-card">
          <div className="mb-6">
               <DrawerSelect 
                  value={selectedDrawerId}
                  onChange={setSelectedDrawerId}
               />
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Amount Taken</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground text-xl font-bold">₱</span>
                </div>
                <input
                  type="number"
                  className="pl-8 w-full border-input rounded-xl shadow-sm focus:ring-2 focus:ring-ring focus:border-ring text-3xl font-bold py-3 border text-foreground bg-muted/20 focus:bg-card transition-colors placeholder-muted-foreground/50"
                  placeholder="0.00"
                  value={baseData.amount}
                  onChange={(e) => setBaseData({...baseData, amount: e.target.value})}
                  autoFocus
                />
              </div>
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date</label>
              <input 
                type="date"
                className={`w-full border-input rounded-xl shadow-sm focus:ring-ring focus:border-ring py-4 px-3 border bg-muted/20 text-foreground text-sm ${customTransactionDate ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
                value={baseData.date}
                onChange={(e) => setBaseData({...baseData, date: e.target.value})}
                disabled={!!customTransactionDate}
              />
            </div>
          </div>

          {customTransactionDate && (
            <div className="mb-6 flex items-start gap-3 bg-amber-500/10 p-4 border border-amber-500/20 rounded-xl text-amber-600 text-[11px] leading-tight">
               <Unlock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
               <span>
                  <span className="font-bold uppercase tracking-tighter">Backdating Active:</span> This transaction will be recorded on {dayjs(customTransactionDate).format("MMMM D, YYYY")}. Ensure this is correct.
               </span>
            </div>
          )}

          <div className="h-px bg-border w-full mb-6"></div>

          {activeTab === 'COGS' && <CogsForm data={specificData} onChange={(d) => setSpecificData({...specificData, ...d})} />}
          {activeTab === 'OPEX' && <OpexForm data={specificData} onChange={(d) => setSpecificData({...specificData, ...d})} />}
          {activeTab === 'REMITTANCE' && <RemittanceForm data={specificData} onChange={(d) => setSpecificData({...specificData, ...d})} />}

          <div className="mt-6">
            <label className="block text-sm font-medium text-foreground mb-2">
                Description / Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
                <div className="absolute top-3 left-3 text-muted-foreground">
                    <FileText size={16} />
                </div>
                <textarea
                className="w-full border-input rounded-xl shadow-sm focus:ring-ring focus:border-ring border p-3 pl-9 text-sm bg-muted/20 focus:bg-card transition-colors text-foreground"
                rows={2}
                placeholder="Add any additional details regarding this transaction..."
                value={baseData.notes}
                onChange={(e) => setBaseData({...baseData, notes: e.target.value})}
                />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/20 flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
                All fields marked with * are required
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleClose}
                    className="px-6 py-2.5 text-foreground bg-card border border-border rounded-xl hover:bg-muted font-semibold text-sm transition-colors shadow-sm"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Saving...' : 'Confirm Cashout'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CashOutModal;
