import React from "react";
import { CheckCircle2, X, Printer } from "lucide-react";
import { TransactionResult } from "../components/buttons/handlers/done";

interface SuccessReceiptModalProps {
  data: TransactionResult;
  onClose: () => void;
}

const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  data,
  onClose,
}) => {
  if (!data) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm animate-in duration-200 fade-in">
      <div className="relative flex flex-col bg-black shadow-[0_0_20px_rgba(6,182,212,0.5)] p-6 border-2 border-retro-cyan rounded-lg w-full max-w-md font-retro text-retro-cyan">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <CheckCircle2 className="mb-2 w-16 h-16 text-green-400" />
          <h2 className="font-bold text-2xl uppercase tracking-widest">
            Transaction Success
          </h2>
          <p className="opacity-70 text-sm">
            {new Date(data.transaction_time).toLocaleString()}
          </p>
        </div>

        {/* Receipt Details (Ticket Style) */}
        <div className="bg-gray-900/50 p-4 border border-retro-cyan/30 rounded font-mono text-sm">
          <div className="flex justify-between mb-2 pb-2 border-retro-cyan/30 border-b">
            <span className="opacity-70">Invoice No:</span>
            <span className="font-bold text-white">{data.invoice_no}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span className="opacity-70">Customer:</span>
            <span className="max-w-[150px] text-white truncate uppercase">
              {data.customer_name}
            </span>
          </div>

          <div className="my-4 border-retro-cyan/30 border-b border-dashed"></div>

          <div className="flex justify-between mb-1">
            <span className="opacity-70">Amount Rendered:</span>
            <span className="text-white">
              ₱{data.amount_rendered.toFixed(2)}
            </span>
          </div>

          {data.voucher > 0 && (
            <div className="flex justify-between mb-1 text-yellow-400">
              <span>Voucher:</span>
              <span>- ₱{data.voucher.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between mt-4 font-bold text-retro-cyan text-lg">
            <span>GRAND TOTAL:</span>
            <span>₱{data.grand_total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mt-2 text-green-400">
            <span>CHANGE:</span>
            <span>₱{data.change.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.print()}
            className="flex flex-1 justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 py-3 rounded font-bold transition-colors"
          >
            <Printer size={18} /> PRINT
          </button>
          <button
            onClick={onClose}
            className="flex flex-1 justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 py-3 rounded font-bold transition-colors"
          >
            <X size={18} /> CLOSE (NEW)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessReceiptModal;
