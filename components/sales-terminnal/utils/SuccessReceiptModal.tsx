import React, { useEffect } from "react";
import { CheckCircle2, X, Printer, Loader2 } from "lucide-react";
import { TransactionResult } from "../components/buttons/handlers/done";

interface SuccessReceiptModalProps {
  data: TransactionResult;
  onClose: () => void;
}

const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  data,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!data) return null;

  return (
    <div className="z-70 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm animate-in duration-200 fade-in px-4">
      <div className="relative flex flex-col bg-card shadow-2xl p-6 border border-border rounded-2xl w-full max-w-sm text-foreground">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <CheckCircle2 className="mb-3 w-16 h-16 text-primary" />
          <h2 className="font-bold text-2xl uppercase tracking-widest text-foreground text-center">
            Success
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(data.transaction_time).toLocaleString()}
          </p>
        </div>

        {/* Receipt Details */}
        <div className="bg-muted/30 p-5 border border-border/50 rounded-xl text-sm">
          <div className="flex justify-between items-center mb-3 pb-3 border-border/50 border-b">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Invoice No</span>
            <span className="font-bold flex items-center gap-2">
              {data.invoice_no === "PENDING..." ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="animate-pulse text-muted-foreground text-xs">{data.invoice_no}</span>
                </>
              ) : (
                <span className="font-mono bg-background px-2 py-0.5 rounded border border-border text-xs">{data.invoice_no}</span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Customer</span>
            <span className="max-w-[150px] font-semibold truncate leading-tight">
              {data.customer_name}
            </span>
          </div>

          <div className="my-4 border-border/50 border-b border-dashed"></div>

          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider mt-0.5">Rendered</span>
            <span className="font-mono">
              ₱{(data.amount_rendered ?? 0).toFixed(2)}
            </span>
          </div>

          {data.voucher > 0 && (
            <div className="flex justify-between mb-2 text-primary">
              <span className="font-medium uppercase text-xs tracking-wider mt-0.5">Voucher</span>
              <span className="font-mono">- ₱{(data.voucher ?? 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between mt-5 font-bold text-lg items-end">
            <span className="uppercase text-xs tracking-widest text-muted-foreground mb-1">Total</span>
            <span className="font-mono text-xl text-primary">₱{(data.grand_total ?? 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between mt-3 font-semibold text-emerald-500 items-center">
            <span className="uppercase text-xs tracking-widest">Change</span>
            <span className="font-mono">₱{(data.change ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.print()}
            className="flex flex-1 justify-center items-center gap-2 bg-muted hover:bg-muted/80 text-foreground py-3.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={onClose}
            className="flex flex-1 justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 py-3.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export { SuccessReceiptModal };
