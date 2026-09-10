import React, { useEffect, useState, useRef } from "react";
import { Ticket, X, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { lookupVoucher, Voucher } from "@/app/actions/vouchers";
import { generateInvoiceNo } from "@/app/transactions/lib/paymentCache";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number; // grandTotal (after discounts)
  orderDiscountAmount?: number;
  subtotal?: number; // cart total before order discount
  onConfirm: (
    payment: number,
    voucher: number,
    voucherData?: {
      id: string;
      code: string;
      amount: number;
    } | null,
    invoiceNo?: string
  ) => void;
}

export const PaymentPopup: React.FC<PaymentPopupProps> = ({
  isOpen,
  onClose,
  totalAmount,
  orderDiscountAmount = 0,
  subtotal = 0,
  onConfirm,
}) => {
  const [payment, setPayment] = useState<string>("");
  const [transactionNo, setTransactionNo] = useState<string>("");
  const paymentInputRef = useRef<HTMLInputElement>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    voucher: Voucher;
    applicableAmount: number;
  } | null>(null);
  const [manualVoucherMode, setManualVoucherMode] = useState(false);
  const [manualVoucherAmount, setManualVoucherAmount] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const invNo = generateInvoiceNo();
      setTransactionNo(invNo);
      
      setPayment("");
      setVoucherCode("");
      setVoucherError(null);
      setAppliedVoucher(null);
      setManualVoucherMode(false);
      setManualVoucherAmount("");
      
      setTimeout(() => {
        paymentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const paymentValue = parseFloat(payment) || 0;
  
  // Calculate effective voucher amount
  const effectiveVoucherAmount = appliedVoucher
    ? appliedVoucher.applicableAmount
    : manualVoucherMode
      ? Math.min(parseFloat(manualVoucherAmount) || 0, totalAmount)
      : 0;

  const amountDue = Math.max(totalAmount - effectiveVoucherAmount, 0);
  const change = paymentValue - amountDue;

  const handleLookupVoucher = async () => {
    if (!voucherCode.trim()) return;
    
    setVoucherLoading(true);
    setVoucherError(null);
    
    try {
      const result = await lookupVoucher(voucherCode, totalAmount);
      if (result.success && result.voucher && result.applicableAmount) {
        setAppliedVoucher({
          voucher: result.voucher,
          applicableAmount: result.applicableAmount,
        });
        setVoucherCode("");
      } else {
        setVoucherError(result.error || "Could not apply voucher.");
      }
    } catch {
      setVoucherError("Failed to validate voucher. Please try again.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  };

  const canComplete = paymentValue >= amountDue || amountDue === 0;

  const handleConfirm = () => {
    if (!canComplete) return;
    
    const voucherData = appliedVoucher
      ? {
          id: appliedVoucher.voucher.id,
          code: appliedVoucher.voucher.code,
          amount: appliedVoucher.applicableAmount,
        }
      : manualVoucherMode && effectiveVoucherAmount > 0
        ? {
            id: '',
            code: 'MANUAL',
            amount: effectiveVoucherAmount,
          }
        : null;

    onConfirm(paymentValue, effectiveVoucherAmount, voucherData, transactionNo);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canComplete) {
        handleConfirm();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleVoucherKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookupVoucher();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-70 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-muted/30 p-4 border-b border-border shrink-0">
          <h2 className="font-bold text-foreground text-xl">Payment</h2>
          <p className="text-muted-foreground text-sm">Invoice No: <span className="font-mono text-primary">{transactionNo}</span></p>
        </div>

        {/* Body — scrollable */}
        <div className="space-y-5 p-6 overflow-y-auto flex-1">
          {/* Amount Summary */}
          <div className="text-center">
            {orderDiscountAmount > 0 && (
              <div className="text-sm text-muted-foreground mb-1">
                Subtotal: ₱{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                <span className="text-red-500 ml-2">-₱{orderDiscountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Grand Total</p>
            <p className="font-bold text-4xl text-primary">
              ₱{totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Voucher Section */}
          <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Ticket className="w-4 h-4 text-purple-500" />
                Voucher
              </div>
              {!appliedVoucher && (
                <button
                  type="button"
                  onClick={() => {
                    setManualVoucherMode(!manualVoucherMode);
                    setVoucherCode("");
                    setVoucherError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {manualVoucherMode ? "Enter Code" : "Manual Amount"}
                </button>
              )}
            </div>

            {appliedVoucher ? (
              /* Applied Voucher Display */
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-bold text-sm text-foreground">{appliedVoucher.voucher.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {appliedVoucher.voucher.label || `₱${appliedVoucher.applicableAmount.toFixed(2)} off`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-500">-₱{appliedVoucher.applicableAmount.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : manualVoucherMode ? (
              /* Manual voucher amount */
              <div>
                <label className="block mb-1 text-muted-foreground text-xs">Voucher Amount (₱)</label>
                <input
                  type="number"
                  value={manualVoucherAmount}
                  onChange={(e) => setManualVoucherAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-muted/20 focus:ring-2 focus:ring-purple-500/50 border border-input rounded-lg w-full px-4 py-2.5 font-bold text-foreground text-lg outline-none transition-all"
                  placeholder="0.00"
                  max={totalAmount}
                />
              </div>
            ) : (
              /* Voucher code lookup */
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase());
                      setVoucherError(null);
                    }}
                    onKeyDown={handleVoucherKeyDown}
                    className="bg-muted/20 focus:ring-2 focus:ring-purple-500/50 border border-input rounded-lg w-full pl-9 pr-4 py-2.5 font-mono text-foreground outline-none transition-all uppercase"
                    placeholder="Enter code..."
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  onClick={handleLookupVoucher}
                  disabled={!voucherCode.trim() || voucherLoading}
                  className={`px-4 rounded-lg font-semibold text-sm transition-all ${
                    voucherCode.trim() && !voucherLoading
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {voucherLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}

            {/* Voucher Error */}
            {voucherError && (
              <div className="flex items-center gap-2 text-sm text-red-500 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {voucherError}
              </div>
            )}
          </div>

          {/* Cash Payment */}
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

          {/* Summary */}
          <div className="bg-muted/20 p-4 rounded-lg space-y-2">
            {effectiveVoucherAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Voucher Applied</span>
                <span className="font-bold text-purple-500">
                  -₱{effectiveVoucherAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {effectiveVoucherAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-bold text-foreground">
                  ₱{amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-border pt-2">
              <span className="font-bold text-muted-foreground">Change</span>
              <span className={`text-2xl font-bold ${change < 0 ? "text-destructive" : "text-primary"}`}>
                ₱{change.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-muted/20 p-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-muted hover:bg-muted/80 py-3 rounded-lg font-medium text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canComplete}
            className={`flex-1 py-3 rounded-lg font-bold text-primary-foreground transition-all ${
              canComplete
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
