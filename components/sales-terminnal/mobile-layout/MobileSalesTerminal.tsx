"use client";

import React, { useState, Suspense } from "react";
import { FormProvider } from "react-hook-form";
import { usePosForm } from "../components/form/usePosForm";
import { MobileHeader } from "./MobileHeader";
import { MobileFormFields } from "./MobileFormFields";
import { MobileActionPanel } from "./MobileActionPanel";
import { MobileCartPanel } from "./MobileCartPanel";
import { PaymentPopup } from "../modals/PaymentPopup";
import { SuccessReceiptModal } from "../utils/SuccessReceiptModal";
import { ErrorMessage } from "../components/ErrorMessage";
import { useTerminalShortcuts } from "../hooks/useTerminalShortcuts";

export const MobileSalesTerminal = () => {
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
    customerId,
  } = usePosForm();

  const [activeField, setActiveField] = useState<"barcode" | "quantity" | null>("barcode");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const watchedCustomerName = methods.watch("customerName");

  // Shortcuts (might be less relevant for mobile, but keeps logic consistent)
  useTerminalShortcuts({
    onClear,
    onCharge: () => setIsPaymentPopupOpen(true),
    onToggleFreeMode: () => {}, // Not yet implemented for mobile simple view
    hasItems: cartItems.length > 0,
  });

  const handlePaymentComplete = (payment: number, voucher: number) => {
    methods.setValue("payment", payment);
    methods.setValue("voucher", voucher);
    methods.setValue("grandTotal", cartTotal - voucher);
    // Trigger submission
    triggerDoneSubmit();
    setIsPaymentPopupOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      <FormProvider {...methods}>
        {/* Header - Fixed Top */}
        <header className="shrink-0 border-b border-border p-2 bg-card">
          <MobileHeader
            customerName={watchedCustomerName || "Walk-in"}
            isCustomerSelected={!!customerId}
            onSearchOpen={() => {}} // TODO: Customer search modal
            onClearCustomer={() => {
                setCustomerId(null);
                methods.setValue("customerName", null);
            }}
            onCustomerNameChange={(name) => methods.setValue("customerName", name)}
            currentProduct={{
                name: "Ready to Scan",
                price: "0.00",
                stock: 0
            }}
            grandTotal={cartTotal}
            isBackdating={false}
          />
        </header>

        {/* Form Fields - Input Bar */}
        <section className="shrink-0 border-b border-border bg-muted/30">
          <MobileFormFields
            onAddToCartClick={() => onAddToCart(false)}
            activeField={activeField}
            setActiveField={setActiveField}
          />
        </section>

        {/* Main Content - QuickPick Grid */}
        <main className="flex-1 overflow-hidden">
          <MobileActionPanel
            onAddToCart={() => onAddToCart(false)}
            onCharge={() => setIsPaymentPopupOpen(true)}
            activeField={activeField}
            setActiveField={setActiveField}
            onClearCart={onClear}
          />
        </main>

        {/* Side Panels & Modals */}
        <MobileCartPanel
          cartItems={cartItems}
          grandTotal={cartTotal}
          onRemoveItem={onRemoveItem}
          onCharge={() => setIsPaymentPopupOpen(true)}
        />

        <PaymentPopup
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
          totalAmount={cartTotal}
          onConfirm={handlePaymentComplete}
        />

        {successData && (
          <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
        )}

        <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />
      </FormProvider>
    </div>
  );
};
