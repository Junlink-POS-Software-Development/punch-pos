"use client";

import FormFields from "./components/FormFields";

import TerminalHeader from "./components/terminal-header/TerminalHeader";

import { FormProvider } from "react-hook-form";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import SuccessReceiptModal from "./utils/SuccessReceiptModal";
import ErrorMessage from "./components/ErrorMessage";
// 1. Import the new hook
import { useTerminalShortcuts } from "./hooks/useTerminalShortcuts"; // Adjust path as needed
import { PaymentPopup } from "./modals/PaymentPopup";
import { useState, useEffect } from "react";
import ActionPanel from "./components/ActionPanel";

const SalesTerminal = () => {
  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
    onDoneSubmit,
    triggerDoneSubmit,
    onClear,

    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
    setCustomerId,
  } = usePosForm();

  // 2. Call the hook and pass the onClear function
  // This replaces the previous useEffect for the "Escape" key
  useTerminalShortcuts({ onClear });

  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  // Shortcut for Payment Popup (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger on Spacebar
      if (e.code === "Space") {
        // Prevent if user is typing in an input field (except if we want to override it, but usually bad UX)
        const activeElement = document.activeElement as HTMLElement;
        const isTextInput = activeElement.tagName === "INPUT" && (activeElement as HTMLInputElement).type === "text";
        
        // Allow if NOT a text input, OR if it IS the barcode input (since barcodes don't usually have spaces)
        // We only want to block it for inputs where typing a space is valid (like Customer Name)
        if (!isTextInput || activeElement.id === "barcode") {
           e.preventDefault();
           if (cartTotal > 0) {
             setIsPaymentPopupOpen(true);
           } else {
               console.log("Cart is empty, cannot open payment popup");
           }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartTotal]);

  const handlePaymentComplete = (payment: number, voucher: number) => {
    const totalPayment = payment + voucher;
    const change = totalPayment - cartTotal;

    // Set values in the form
    methods.setValue("payment", payment);
    methods.setValue("voucher", voucher);
    methods.setValue("grandTotal", cartTotal - voucher);
    methods.setValue("change", change);

    // Clear "Add Item" fields to prevent validation errors blocking submission
    methods.setValue("quantity", null);
    methods.setValue("barcode", "");

    // Trigger submission using the helper that handles errors
    triggerDoneSubmit();
    setIsPaymentPopupOpen(false);
  };

  return (
    <div className="relative flex flex-row h-full overflow-hidden">
      {/* LEFT PANEL: Transaction Details */}
      <div className="flex flex-col flex-1 p-4 h-full min-w-0">
        <FormProvider {...methods}>
          <TerminalHeader 
 
            setCustomerId={setCustomerId} 
            grandTotal={cartItems.reduce((sum, item) => sum + item.total, 0)}
          />

          <form
            id="sales-form"
            onSubmit={methods.handleSubmit(onDoneSubmit)}
            className={`flex flex-col gap-4 w-full h-full overflow-hidden`}
          >
            <div className="relative flex flex-col w-full shrink-0">
              <FormFields
                onAddToCartClick={onAddToCart}
                onDoneSubmitTrigger={triggerDoneSubmit}
              />
            </div>
            <div className="border border-slate-800 bg-slate-900/30 rounded-2xl w-full grow overflow-hidden min-h-0">
              <TerminalCart
                rows={cartItems}
                onRemoveItem={onRemoveItem}
                onUpdateItem={onUpdateItem}
              />
            </div>
          </form>
        </FormProvider>
      </div>

      {/* RIGHT PANEL: Action Panel */}
      <ActionPanel />

      {successData && (
        <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
      )}

      <PaymentPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        totalAmount={cartTotal}
        onConfirm={handlePaymentComplete}
      />

      <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />
    </div>
  );
};

export default SalesTerminal;
