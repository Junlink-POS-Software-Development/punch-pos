import React from "react";
import { Plus, Minus, CreditCard, Tag, Ticket, Archive } from "lucide-react";

interface ActionButtonsProps {
  onAdd: () => void;
  onDiscount: () => void;
  onVoucher: () => void;
  onOpenDrawer: () => void;
  onCharge: () => void;
  onIncreaseQty: () => void;
  onDecreaseQty: () => void;
}

export const ActionButtons = ({
  onAdd,
  onDiscount,
  onVoucher,
  onOpenDrawer,
  onCharge,
  onIncreaseQty,
  onDecreaseQty,
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Primary Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onAdd}
          className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          ADD
        </button>
        <button
          onClick={onDiscount}
          className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Tag className="w-4 h-4" />
          DISC
        </button>
        <button
          onClick={onVoucher}
          className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Ticket className="w-4 h-4" />
          VOUCH
        </button>
        <button
          onClick={onOpenDrawer}
          className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Archive className="w-4 h-4" />
          DRAWER
        </button>
      </div>

      {/* Charge and Qty Control */}
      <div className="grid grid-cols-4 gap-2 h-16">
        <button
          onClick={onDecreaseQty}
          className="col-span-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Minus className="w-6 h-6" />
        </button>
        
        <button
          onClick={onCharge}
          className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          CHARGE
        </button>

        <button
          onClick={onIncreaseQty}
          className="col-span-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
