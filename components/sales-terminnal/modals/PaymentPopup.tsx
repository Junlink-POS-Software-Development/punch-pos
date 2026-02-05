import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (payment: number, voucher: number) => void;
}

export const PaymentPopup: React.FC<PaymentPopupProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
}) => {
  const [payment, setPayment] = useState<string>("");
  const [voucher, setVoucher] = useState<string>("");
  const [transactionNo, setTransactionNo] = useState<string>("");
  const paymentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Generate a temporary transaction number for display
      const dateStr = dayjs().format("YYYYMMDD");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setTransactionNo(`TRX-${dateStr}-${randomSuffix}`);
      
      setPayment("");
      setVoucher("");
      
      // Focus payment input after a short delay to ensure modal is rendered
      setTimeout(() => {
        paymentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const paymentValue = parseFloat(payment) || 0;
  const voucherValue = parseFloat(voucher) || 0;
  const totalPayment = paymentValue + voucherValue;
  const change = totalPayment - totalAmount;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (totalPayment >= totalAmount) {
        onConfirm(paymentValue, voucherValue);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-70 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 p-4 border-b border-border">
          <h2 className="font-bold text-foreground text-xl">Payment</h2>
          <p className="text-muted-foreground text-sm">Transaction No: <span className="font-mono text-primary">{transactionNo}</span></p>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Grand Total Display */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Amount Due</p>
            <p className="font-bold text-5xl text-primary">
              ₱{totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-muted-foreground text-sm">Cash Payment</label>
              <input
                ref={paymentInputRef}
                type="number"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-muted/20 focus:ring-2 focus:ring-primary/50 border border-input rounded-lg w-full px-4 py-3 font-bold text-foreground text-xl outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block mb-1 text-muted-foreground text-sm">Voucher</label>
              <input
                type="number"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-muted/20 focus:ring-2 focus:ring-purple-500/50 border border-input rounded-lg w-full px-4 py-3 font-bold text-foreground text-xl outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold text-muted-foreground">Change</span>
              <span className={`text-2xl font-bold ${change < 0 ? "text-destructive" : "text-primary"}`}>
                ₱{change.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-muted/20 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 bg-muted hover:bg-muted/80 py-3 rounded-lg font-medium text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (totalPayment >= totalAmount) {
                onConfirm(paymentValue, voucherValue);
              }
            }}
            disabled={totalPayment < totalAmount}
            className={`flex-1 py-3 rounded-lg font-bold text-primary-foreground transition-all ${
              totalPayment >= totalAmount
                ? "bg-primary hover:bg-primary/90 shadow-md"
                : "bg-muted cursor-not-allowed opacity-50"
            }`}
          >
            Complete (Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
